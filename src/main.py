from fastapi import FastAPI, HTTPException, Depends
from typing import List
from datetime import datetime
from pydantic import BaseModel
import random
import math
from lib.db import Base, engine
import models
from services.posts import router


app = FastAPI()


Base.metadata.create_all(bind=engine)
app.include_router(router)

class Feedback(BaseModel):
    user_id: str
    feedback: str


@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now() }

@app.post("/feedback")
def feedback(data: Feedback):
    print(data)
    return {
        "feedback_id": str(math.floor(random.random() * 100)) + str(datetime.now()),
        "status":"stored"
    }

@app.get("/greet/{name}")
async def greet(name: str):
    print("hello,", name)
    return {"message": f"hello, {name}"}
