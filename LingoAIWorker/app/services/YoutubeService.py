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
        'writeautomaticsub': True,
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
            duration = int(info.get("duration") or 0)

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
                "duration": duration,
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
            duration = int(info.get("duration") or 0)
            tags = info.get("tags") or []
            tags_str = ", ".join(tags[:20])
            channel = info.get("uploader") or info.get("channel") or ""

            return {
                "status": "success",
                "file_path": f"{video_id}.mp3",
                "initial_prompt": title,
                "duration": duration,
                "tags": tags_str,
                "channel": channel
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}


def get_subtitle_list(url: str) -> dict:
    ydl_opts = {
        'skip_download': True,
        'quiet': True,
        'no_warnings': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if not info:
                return {"status": "error", "message": "Không thể lấy thông tin video."}

            video_id = info.get("id", "")
            title = info.get("title", "")
            thumbnail = info.get("thumbnail", "")
            duration = info.get("duration", 0)
            channel = info.get("uploader") or info.get("channel") or ""

            raw_manual = info.get('subtitles', {}) or {}
            raw_auto = info.get('automatic_captions', {}) or {}

            subtitles_list = []

            for lang_code, formats in raw_manual.items():
                name = lang_code
                if formats and isinstance(formats, list) and len(formats) > 0:
                    name = formats[0].get('name') or lang_code
                subtitles_list.append({
                    "code": lang_code,
                    "name": name,
                    "type": "manual",
                    "is_auto": False
                })

            for lang_code, formats in raw_auto.items():
                if any(s["code"] == lang_code and not s["is_auto"] for s in subtitles_list):
                    continue
                name = lang_code
                if formats and isinstance(formats, list) and len(formats) > 0:
                    name = formats[0].get('name') or f"{lang_code} (Auto)"
                subtitles_list.append({
                    "code": lang_code,
                    "name": name,
                    "type": "auto",
                    "is_auto": True
                })

            return {
                "status": "success",
                "video_id": video_id,
                "title": title,
                "channel": channel,
                "thumbnail": thumbnail,
                "duration": duration,
                "subtitles": subtitles_list,
                "has_subtitles": len(subtitles_list) > 0
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }