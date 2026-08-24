"""
Audio generation endpoints for TCM point pronunciation.

- API key is loaded from `ELEVENLABS_API_KEY` in backend/.env and never
  returned to the client.
- MP3 files are written to AUDIO_OUTPUT_DIR (default:
  /app/frontend/public/audio) so the React app can serve them as static
  assets at /audio/<CODE>-<NUM>.mp3.
- Generation is idempotent: existing files are skipped unless `force=True`.

Teaching-style script:
    "<CODE> <NUM>."   pause 0.9s
    "<HANZI>."        pause 0.9s
    "<pinyin>."       pause 0.7s      (slow, syllable-separated)
    "<HANZI>."        pause 0.5s      (repeat)
    "<pinyin>."                         (repeat)

Voice tuned for mature male teaching narration: slower speed, moderate
stability, slight style so the Mandarin tones remain expressive.
"""

from __future__ import annotations

import logging
import os
import re
from pathlib import Path
from typing import List, Literal, Optional

from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

AUDIO_OUTPUT_DIR = Path(os.environ.get("AUDIO_OUTPUT_DIR", "/app/frontend/public/audio"))
AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "nPczCjzI2devNBz1zQrb")  # Brian
DEFAULT_MODEL_ID = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")

# Teaching-voice defaults (slow, calm, deliberate).
DEFAULT_VOICE_SETTINGS = {
    "stability": 0.65,
    "similarity_boost": 0.80,
    "style": 0.15,
    "use_speaker_boost": True,
    "speed": 0.80,  # 0.7 – 1.2 supported by multilingual v2
}


class PointGenerationRequest(BaseModel):
    code: str = Field(..., description="Meridian code, e.g. 'LU'")
    num: int = Field(..., ge=1, description="Point number, e.g. 7")
    hanzi: str = Field(..., min_length=1, description="Chinese characters to synthesize")
    pinyin: Optional[str] = Field(
        default=None,
        description="Pinyin with tone marks; included in the teaching script when provided.",
    )
    custom_script: Optional[str] = Field(
        default=None,
        description=(
            "Optional verbatim script sent to the TTS engine. When set, the "
            "default teaching-script builder is bypassed. Useful for tuning "
            "individual samples (e.g. syllable-isolated pronunciation drills)."
        ),
    )


class GenerateBatchRequest(BaseModel):
    points: List[PointGenerationRequest]
    voice_id: Optional[str] = None
    model_id: Optional[str] = None
    force: bool = Field(default=False, description="Regenerate even if MP3 already exists")
    stability: Optional[float] = None
    similarity_boost: Optional[float] = None
    style: Optional[float] = None
    speed: Optional[float] = None


class PointGenerationResult(BaseModel):
    code: str
    num: int
    hanzi: str
    file: str
    url: str
    status: Literal["generated", "skipped_exists", "error"]
    error: Optional[str] = None
    bytes: Optional[int] = None
    script: Optional[str] = None


class GenerateBatchResponse(BaseModel):
    results: List[PointGenerationResult]
    generated: int
    skipped: int
    errors: int
    voice_id: str
    model_id: str


class AudioListItem(BaseModel):
    key: str
    url: str
    bytes: int


class AudioListResponse(BaseModel):
    items: List[AudioListItem]
    total: int


router = APIRouter(prefix="/audio", tags=["audio"])


def _get_client() -> ElevenLabs:
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY not configured")
    return ElevenLabs(api_key=api_key)


def _mp3_path(code: str, num: int) -> Path:
    return AUDIO_OUTPUT_DIR / f"{code.upper()}-{num}.mp3"


# ---------------------------------------------------------------------------
# Teaching-script builder
# ---------------------------------------------------------------------------

def _slow_pinyin(pinyin: str) -> str:
    """Insert an ellipsis between syllables so the TTS reads them separately.

    Example: 'Zú Sān Lǐ' -> 'Zú... Sān... Lǐ'
    """
    if not pinyin:
        return ""
    syllables = [s for s in re.split(r"\s+", pinyin.strip()) if s]
    return "... ".join(syllables)


def build_teaching_script(code: str, num: int, hanzi: str, pinyin: Optional[str]) -> str:
    """Build the paced teaching-mode script for one point.

    Structure (matches user spec):
      <CODE> <NUM>.  <break 0.9s>
      <HANZI>.       <break 0.9s>
      <pinyin slow>. <break 0.7s>
      <HANZI>.       <break 0.5s>
      <pinyin>.

    ElevenLabs multilingual v2 honours <break time="X.Xs" /> up to ~3s and
    total silence up to ~5s per request.
    """
    parts: List[str] = []
    parts.append(f"{code.upper()} {num}.")
    parts.append('<break time="0.9s" />')
    parts.append(f"{hanzi}。")
    parts.append('<break time="0.9s" />')
    if pinyin:
        parts.append(f"{_slow_pinyin(pinyin)}.")
        parts.append('<break time="0.7s" />')
        parts.append(f"{hanzi}。")
        parts.append('<break time="0.5s" />')
        parts.append(f"{pinyin}.")
    else:
        parts.append(f"{hanzi}。")
    return " ".join(parts)


def _build_voice_settings(payload: GenerateBatchRequest) -> VoiceSettings:
    settings = dict(DEFAULT_VOICE_SETTINGS)
    for k in ("stability", "similarity_boost", "style", "speed"):
        v = getattr(payload, k)
        if v is not None:
            settings[k] = v
    return VoiceSettings(**settings)


def _synthesize_to_file(
    client: ElevenLabs,
    text: str,
    voice_id: str,
    model_id: str,
    voice_settings: VoiceSettings,
    out_path: Path,
) -> int:
    audio_iter = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=model_id,
        output_format="mp3_44100_128",
        voice_settings=voice_settings,
    )
    total = 0
    with out_path.open("wb") as f:
        for chunk in audio_iter:
            if not chunk:
                continue
            f.write(chunk)
            total += len(chunk)
    return total


@router.post("/generate", response_model=GenerateBatchResponse)
async def generate_batch(payload: GenerateBatchRequest) -> GenerateBatchResponse:
    if not payload.points:
        raise HTTPException(status_code=400, detail="No points provided")

    voice_id = payload.voice_id or DEFAULT_VOICE_ID
    model_id = payload.model_id or DEFAULT_MODEL_ID
    voice_settings = _build_voice_settings(payload)
    client = _get_client()

    results: List[PointGenerationResult] = []
    generated = skipped = errors = 0

    for p in payload.points:
        out_path = _mp3_path(p.code, p.num)
        url = f"/audio/{out_path.name}"
        script = p.custom_script or build_teaching_script(p.code, p.num, p.hanzi, p.pinyin)

        if out_path.exists() and not payload.force:
            skipped += 1
            results.append(
                PointGenerationResult(
                    code=p.code.upper(),
                    num=p.num,
                    hanzi=p.hanzi,
                    file=str(out_path),
                    url=url,
                    status="skipped_exists",
                    bytes=out_path.stat().st_size,
                    script=script,
                )
            )
            continue

        try:
            written = _synthesize_to_file(
                client, script, voice_id, model_id, voice_settings, out_path
            )
            generated += 1
            results.append(
                PointGenerationResult(
                    code=p.code.upper(),
                    num=p.num,
                    hanzi=p.hanzi,
                    file=str(out_path),
                    url=url,
                    status="generated",
                    bytes=written,
                    script=script,
                )
            )
        except Exception as exc:  # noqa: BLE001
            errors += 1
            logger.exception("ElevenLabs generation failed for %s%s", p.code, p.num)
            if out_path.exists():
                try:
                    out_path.unlink()
                except OSError:
                    pass
            results.append(
                PointGenerationResult(
                    code=p.code.upper(),
                    num=p.num,
                    hanzi=p.hanzi,
                    file=str(out_path),
                    url=url,
                    status="error",
                    error=str(exc),
                    script=script,
                )
            )

    return GenerateBatchResponse(
        results=results,
        generated=generated,
        skipped=skipped,
        errors=errors,
        voice_id=voice_id,
        model_id=model_id,
    )


@router.get("/list", response_model=AudioListResponse)
async def list_audio() -> AudioListResponse:
    items: List[AudioListItem] = []
    for f in sorted(AUDIO_OUTPUT_DIR.glob("*.mp3")):
        key = f.stem
        items.append(AudioListItem(key=key, url=f"/audio/{f.name}", bytes=f.stat().st_size))
    return AudioListResponse(items=items, total=len(items))
