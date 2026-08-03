from fastapi import FastAPI
from app.api.VideoController import router as video_router

app = FastAPI(
    title="LingoSync AI Worker",
    description="API xử lý phụ đề và âm thanh cho hệ thống LingoSync",
    version="1.0.0",
)

app.include_router(video_router, prefix="/api/video", tags=["Video"])

@app.get("/")
async def root():
    return {"status": "success",
            "message": "LingoSync AI Worker đang chạy ngon lành!"
    }


#chạy : uvicorn main:app --reload