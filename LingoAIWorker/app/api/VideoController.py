from fastapi import APIRouter, HTTPException
from app.services.TranslateService import translateUsingGemini, translateUsingGoogle
from app.models.video import VideoSubtitle, VideoUrlRequest
from app.services.YoutubeService import getYoutubeSubtitle, downloadAudio, get_subtitle_list
from app.services.WhisperService import transcribeAudio, unload_model
from app.services.llmEditor import cleanTranscript

router = APIRouter()

@router.post("/get_subtitles")
async def getSub(req: VideoSubtitle):
    yt_res = getYoutubeSubtitle(req.url, req.lang)
    if yt_res["status"] == "success":
        translated_res = translateUsingGemini(
            data=yt_res["data"],
            tgt_lang=req.tgt_lang,
            video_title=yt_res.get("title", ""),
            video_tags=yt_res.get("tags", ""),
            channel=yt_res.get("channel", "")
        )
        return {
            "source": "youtube_native", 
            "data": translated_res, 
            "title": yt_res.get("title", ""),
            "duration": yt_res.get("duration", 0),
            "language": yt_res.get("language") or req.lang or "en"
        }
    audio_res = downloadAudio(req.url)
    if audio_res["status"] != "success":
        raise HTTPException(status_code=400, detail="Không thể tải video/audio từ URL này.")

    video_title = audio_res.get("initial_prompt", "")
    video_duration = audio_res.get("duration", 0)
    video_tags  = audio_res.get("tags", "")
    video_channel = audio_res.get("channel", "")
    whisper_prompt = f"{video_title}. {video_tags}".strip(". ")
    model_res = transcribeAudio(audio_res["file_path"], whisper_prompt)
    unload_model()

    if model_res["status"] != "success":
        raise HTTPException(status_code=500, detail="Lỗi trong quá trình AI xử lý âm thanh.")
    cleaned = cleanTranscript(model_res["data"], video_title, video_tags, video_channel)

    translated = translateUsingGemini(
        data=cleaned,
        tgt_lang=req.tgt_lang,
        video_title=video_title,
        video_tags=video_tags,
        channel=video_channel
    )

    detected_lang = model_res.get("language") or req.lang or "en"

    return {
        "source": "cleaned_whisper", 
        "data": translated, 
        "title": video_title,
        "duration": video_duration,
        "language": detected_lang
    }

@router.post("/subtitle-list")
async def list_subtitles_endpoint(req: VideoUrlRequest):
    return get_subtitle_list(req.url)