from faster_whisper import WhisperModel
import os

model_size = "small"
model = WhisperModel(model_size, device = "cuda", compute_type="float16")

def format_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02}:{m:02}:{s:02}"

def transcribeAudio(audio_path: str, initial_prompt: str):
    try:
        segments, info = model.transcribe(audio_path, beam_size=5, vad_filter=True, vad_parameters=dict(
            min_silence_duration_ms=500,
            speech_pad_ms=100),
            condition_on_previous_text=False,
            initial_prompt=initial_prompt,
        )

        output_data = []
        for segment in segments:
            output_data.append(
                {
                    "time": format_time(segment.start),
                    "text": segment.text.strip(),
                }
            )

        if os.path.exists(audio_path):
            os.remove(audio_path)
        return {"status": "success", "data": output_data, "language": info.language}
    except Exception as e:
        print(f"[WhisperService] Lỗi transcribe: {type(e).__name__}: {e}")
        return {"status": "error", "message": str(e)}