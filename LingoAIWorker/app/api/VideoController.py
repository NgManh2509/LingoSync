from fastapi import APIRouter,HTTPException
from app.models.video import VideoSubtitle
from app.services.YoutubeService import getYoutubeSubtitle, downloadAudio
from app.services.WhisperService import transcribeAudio
from app.services.llmEditor import cleanTranscript
from app.services.TranslateService import translateAll

router = APIRouter()

@router.post("/getSub")
async def getSub(req: VideoSubtitle):
    yt_res = getYoutubeSubtitle(req.url, req.lang)
    if yt_res["status"] == "success":
        translated_res = translateAll(
            data=yt_res["data"],
            src_lang=req.lang,      # YouTube sub đã biết ngôn ngữ từ req.lang
            tgt_lang=req.tgt_lang
        )
        return {"source": "youtube_native", "data": translated_res}

    audio_res = downloadAudio(req.url)
    if audio_res["status"] != "success":
        raise HTTPException(status_code=400, detail="Không thể tải video/audio từ URL này.")

    video_title = audio_res.get("initial_prompt", "")
    video_tags = audio_res.get("tags", "")
    whisper_prompt = f"{video_title}. {video_tags}".strip(". ")

    model_res = transcribeAudio(audio_res["file_path"], whisper_prompt)
    if model_res["status"] == "success":
        clean_res = cleanTranscript(model_res["data"], video_title, video_tags)
        translated_res = translateAll(
            data=clean_res,
            src_lang=model_res["language"], 
            tgt_lang=req.tgt_lang            
        )
        return {"source": "cleaned_whisper", "data": translated_res}
    else:
        raise HTTPException(status_code=500, detail="Lỗi trong quá trình AI xử lý âm thanh.")