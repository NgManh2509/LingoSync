from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from app.models.LingoDictionary import LingoDictionary

router = APIRouter()

dict_service = LingoDictionary()

class WordLookUpResponse(BaseModel):
    source_lang: str
    target_lang: str
    original_word: str
    base_word: str
    phonetic: str
    meaning: str

@router.get("/lookup", response_model=WordLookUpResponse)
async def lookup_word(
    word: str = Query(..., description="Từ cần tra cứu", min_length=1),
    source_lang: str = Query("en", description="Ngôn ngữ của từ (en, de, fr, es, zh, ja, ko)"),
    target_lang: str = Query("vi", description="Ngôn ngữ cần dịch nghĩa sang")
):
    clean_word = word.strip()
    if not clean_word:
        raise HTTPException(status_code=400, detail="Từ tra cứu không được để trống")

    result = dict_service.get_word_info(
        word=clean_word,
        lang_code=source_lang.lower(),
        target_lang=target_lang.lower()
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result
