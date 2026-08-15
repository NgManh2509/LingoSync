import yt_dlp
import os
import re
import json

def saveOriginalSub(data, folder_path: str = "subtitles", video_id: str = "original") -> str:
   os.makedirs(folder_path, exist_ok=True)
   file_path = os.path.join(folder_path, f"{video_id}_original.json")
   with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
   return file_path
        
def getYoutubeSubtitle(url: str, lang: str = "en"):
    ydl_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': False,
        'subtitleslangs': [lang],
        'subtitlesformat': 'srt',
        'outtmpl': '%(id)s.%(ext)s',
        'quiet': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_id = info["id"]
            filenameSrt = f"{video_id}.{lang}.srt"
            filenameVTT = f"{video_id}.{lang}.vtt"
            filename = filenameSrt if os.path.exists(filenameSrt) else filenameVTT if os.path.exists(filenameVTT) else None

            title = info.get("title", "")
            tags = info.get("tags") or []
            tags_str = ", ".join(tags[:20])
            channel = info.get("uploader") or info.get("channel") or ""

        if filename:
            with open(filename, "r", encoding="utf-8") as f:
                content = f.read()

            pattern = re.compile(
                r'(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}\r?\n(.*?)(?=\r?\n\r?\n|\Z)',
                re.DOTALL)
            matches = pattern.findall(content.strip())

            json_data = []
            for time_str, text_raw in matches:
                clean_text = re.sub(r'<[^>]+>', '', text_raw).strip()
                clean_text = clean_text.replace("\n", " ")
                json_data.append({
                    "time": time_str[:8],
                    "text": clean_text
                })
            os.remove(filename)
            saveOriginalSub(json_data, folder_path="original/subtitles", video_id=video_id)
            return {
                "status": "success",
                "data": json_data,
                "title": title,
                "tags": tags_str,
                "channel": channel
            }
        else:
            return {"status": "error", "message": "Không tìm thấy file phụ đề."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def downloadAudio(url: str):

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': '%(id)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'noplaylist': True,
        'ignoreerrors': True,
        'quiet': False
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_id = info["id"]
            title = info.get("title", "")
            tags = info.get("tags") or []
            tags_str = ", ".join(tags[:20])
            channel = info.get("uploader") or info.get("channel") or ""

            return {
                "status": "success",
                "file_path": f"{video_id}.mp3",
                "initial_prompt": title,
                "tags": tags_str,
                "channel": channel
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}