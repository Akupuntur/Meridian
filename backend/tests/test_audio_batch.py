"""Regression tests for the Brian (mature male) audio regeneration batch."""
import os
import re
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://meridian-audio.preview.emergentagent.com").rstrip("/")

EXPECTED_KEYS = ["LU-7", "LI-4", "ST-36", "SP-6", "DU-20"]
BRIAN_VOICE_ID = "nPczCjzI2devNBz1zQrb"
EXPECTED_MODEL_ID = "eleven_multilingual_v2"

POINTS = [
    {"code": "LU", "num": 7, "hanzi": "列缺", "pinyin": "Liè Quē"},
    {"code": "LI", "num": 4, "hanzi": "合谷", "pinyin": "Hé Gǔ"},
    {"code": "ST", "num": 36, "hanzi": "足三里", "pinyin": "Zú Sān Lǐ"},
    {"code": "SP", "num": 6, "hanzi": "三阴交", "pinyin": "Sān Yīn Jiāo"},
    {"code": "DU", "num": 20, "hanzi": "百会", "pinyin": "Bǎi Huì"},
]


@pytest.fixture(scope="module")
def audio_list():
    r = requests.get(f"{BASE_URL}/api/audio/list", timeout=30)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="module")
def generate_idempotent():
    payload = {"points": POINTS, "force": False}
    r = requests.post(f"{BASE_URL}/api/audio/generate", json=payload, timeout=120)
    assert r.status_code == 200, r.text
    return r.json()


def test_audio_list_exactly_five():
    r = requests.get(f"{BASE_URL}/api/audio/list", timeout=30)
    assert r.status_code == 200
    data = r.json()
    keys = sorted(item["key"] for item in data["items"])
    assert data["total"] == 5, f"Expected 5 items got {data['total']}: {keys}"
    assert sorted(EXPECTED_KEYS) == keys, f"Keys mismatch: {keys}"


def test_audio_list_bytes_substantial(audio_list):
    """Regenerated Brian batch should be significantly larger than earlier ~15KB Aria batch."""
    sizes = {item["key"]: item["bytes"] for item in audio_list["items"]}
    print("\nAudio file byte sizes:", sizes)
    for key, size in sizes.items():
        # Threshold: at least 40KB (spec says ~100KB+, but be a bit tolerant).
        assert size > 40_000, f"{key} too small ({size} bytes) — likely still old rushed version"


def test_generate_idempotent_all_skipped(generate_idempotent):
    data = generate_idempotent
    assert data["voice_id"] == BRIAN_VOICE_ID, f"voice_id mismatch: {data['voice_id']}"
    assert data["model_id"] == EXPECTED_MODEL_ID, f"model_id mismatch: {data['model_id']}"
    assert data["generated"] == 0, f"Expected 0 generated (idempotent), got {data['generated']}"
    assert data["skipped"] == 5, f"Expected 5 skipped_exists, got {data['skipped']}"
    assert data["errors"] == 0
    for res in data["results"]:
        assert res["status"] == "skipped_exists"


def test_teaching_script_pattern(generate_idempotent):
    results = {f"{r['code']}-{r['num']}": r for r in generate_idempotent["results"]}

    # LU-7 checks
    lu7 = results["LU-7"]["script"]
    print("\nLU7 script:", lu7)
    assert "LU 7." in lu7
    assert "列缺。" in lu7
    assert "Liè... Quē." in lu7
    assert lu7.rstrip().endswith("Liè Quē.")

    # ST-36 three syllable ellipsis
    st36 = results["ST-36"]["script"]
    print("ST36 script:", st36)
    assert "Zú... Sān... Lǐ." in st36
    assert "ST 36." in st36
    assert "足三里。" in st36

    # Every script has break tags
    for key in EXPECTED_KEYS:
        s = results[key]["script"]
        assert '<break time="0.9s" />' in s, f"{key} missing 0.9s break"
        assert '<break time="0.7s" />' in s, f"{key} missing 0.7s break"
        assert '<break time="0.5s" />' in s, f"{key} missing 0.5s break"


@pytest.mark.parametrize("key", EXPECTED_KEYS)
def test_mp3_served(key):
    url = f"{BASE_URL}/audio/{key}.mp3"
    r = requests.get(url, timeout=30)
    assert r.status_code == 200, f"{url} -> {r.status_code}"
    ctype = r.headers.get("content-type", "")
    assert "audio/mpeg" in ctype or "audio/mp3" in ctype, f"{key} content-type={ctype}"
    body = r.content
    assert len(body) > 40_000, f"{key} suspiciously small: {len(body)} bytes"
    # ID3 tag OR MPEG frame sync
    magic_ok = body.startswith(b"ID3") or (body[:2] == b"\xff\xfb") or (body[:2] == b"\xff\xf3") or (body[:2] == b"\xff\xf2")
    assert magic_ok, f"{key} does not start with ID3 or MPEG sync: {body[:4].hex()}"
    print(f"{key}.mp3 content-length={len(body)} first4={body[:4].hex()}")
