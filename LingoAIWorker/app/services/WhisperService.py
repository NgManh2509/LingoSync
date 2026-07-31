
import torch
import gc
import os
from dotenv import load_dotenv

load_dotenv()
print("Thư mục Cache hiện tại đang trỏ về:", os.environ.get("HF_HOME"))

from faster_whisper import WhisperModel
MODEL_SIZE = "small"
_model = None  # Lazy loaded — chỉ load khi cần, unload sau khi xong


def _get_model():
    global _model
    if _model is None:
        print("[WhisperService] Loading Whisper model to GPU...")
        _model = WhisperModel(MODEL_SIZE, device="cuda", compute_type="float16")
    return _model


def unload_model():
    global _model
    if _model is not None:
        del _model
        _model = None
        gc.collect()
        torch.cuda.empty_cache()
        print("[WhisperService] Model unloaded, VRAM freed.")


def format_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02}:{m:02}:{s:02}"


def transcribeAudio(audio_path: str, initial_prompt: str):
    try:
        model = _get_model()
        segments, info = model.transcribe(
            audio_path,
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500, speech_pad_ms=100),
            condition_on_previous_text=False,
            initial_prompt=initial_prompt,
        )

        output_data = []
        for segment in segments:
            output_data.append({
                "time": format_time(segment.start),
                "text": segment.text.strip(),
            })

        if os.path.exists(audio_path):
            os.remove(audio_path)

        return {"status": "success", "data": output_data, "language": info.language}
    except Exception as e:
        print(f"[WhisperService] Lỗi transcribe: {type(e).__name__}: {e}")
        return {"status": "error", "message": str(e)}