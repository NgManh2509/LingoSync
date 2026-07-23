from pydantic import BaseModel

class VideoSubtitle(BaseModel):
    url: str
    lang: str = "en"