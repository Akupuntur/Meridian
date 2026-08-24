"""
Audio generation endpoints for TCM point pronunciation.

- API key is loaded from `ELEVENLABS_API_KEY` in backend/.env and never
  returned to the client.
- MP3 files are written to AUDIO_OUTPUT_DIR (default:
  /app/frontend/public/audio) so the React app can serve them as static
  assets at /audio/<CODE>-<NUM>.mp3.
- Generation is idempotent: existing files are skipped unless `force=True`.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import List, Literal, Optional

from elevenlabs.client import ElevenLabs
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

AUDIO_OUTPUT_DIR = Path(os.environ.get("AUDIO_OUTPUT_DIR", "/app/frontend/public/audio"))
AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "9BWtsMINqrJLrRacOk9x")  # Aria
DEFAULT_MODEL_ID = os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")


class PointGenerationRequest(BaseModel):
    code: str = Field(..., description="Meridian code, e.g. 'LU'")
    num: int = Field(..., ge=1, description="Point number, e.g. 7")
    hanzi: str = Field(..., min_length=1, description="Chinese characters to synthesize")


class GenerateBatchRequest(BaseModel):
    points: List[PointGenerationRequest]
    voice_id: Optional[str] = None
    model_id: Optional[str] = None
    force: bool = Field(default=False, description="Regenerate even if MP3 already exists")


class PointGenerationResult(BaseModel):
    code: str
    num: int
    hanzi: str
    file: str
    url: str
    status: Literal["generated", "skipped_exists", "error"]
    error: Optional[str] = None
    bytes: Optional[int] = None


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


def _synthesize_to_file(
    client: ElevenLabs,
    hanzi: str,
    voice_id: str,
    model_id: str,
    out_path: Path,
) -> int:
    audio_iter = client.text_to_speech.convert(
        text=hanzi,
        voice_id=voice_id,
        model_id=model_id,
        output_format="mp3_44100_128",
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
    client = _get_client()

    results: List[PointGenerationResult] = []
    generated = skipped = errors = 0

    for p in payload.points:
        out_path = _mp3_path(p.code, p.num)
        url = f"/audio/{out_path.name}"

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
                )
            )
            continue

        try:
            written = _synthesize_to_file(client, p.hanzi, voice_id, model_id, out_path)
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
                )
            )
        except Exception as exc:  # noqa: BLE001
            errors += 1
            logger.exception("ElevenLabs generation failed for %s%s", p.code, p.num)
            # Clean up partial file to keep idempotency reliable.
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
        key = f.stem  # e.g. "LU-7"
        items.append(AudioListItem(key=key, url=f"/audio/{f.name}", bytes=f.stat().st_size))
    return AudioListResponse(items=items, total=len(items))
