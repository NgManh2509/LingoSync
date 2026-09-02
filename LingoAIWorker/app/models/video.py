from pydantic import BaseModel

class VideoSubtitle(BaseModel):
    url: str
    lang: str = "en"
    tgt_lang: str = "vi"  

class VideoUrlRequest(BaseModel):
    url: str
