from fastapi import FastAPI, UploadFile, File
from pathlib import Path
from uuid import uuid4
from .utils.file import save_to_disk

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "healthy 👀"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    if(file.headers.get("content-type") != "application/pdf"):
        return {"error": "Only PDF files are allowed."}
    
    id = str(uuid4())
    upload_dir = Path(f"/mnt/uploads/{id}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = f"/mnt/uploads/{id}/{file.filename}"
    content = file.file.read()
 
    success = await save_to_disk(content, file_path)
    print(success)
    if not success:
        return {"error": "Failed to save the file."}

    return {"message": "Uploaded successfully", "file_id": id}

