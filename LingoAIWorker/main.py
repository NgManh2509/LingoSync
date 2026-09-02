from fastapi import FastAPI
from app.api.VideoController import router as video_router
from app.api.DictionaryController import router as word_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(
    title="LingoSync AI Worker",
    description="API xử lý phụ đề và âm thanh cho hệ thống LingoSync",
    version="1.0.0",
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(video_router, prefix="/api/video", tags=["Video"])
app.include_router(word_router, prefix="/api/word", tags=["Word"])

@app.get("/")
async def root():
    return {"status": "success",
            "message": "LingoSync AI Worker đang chạy ngon lành!"
    }


#chạy : uvicorn main:app --reload