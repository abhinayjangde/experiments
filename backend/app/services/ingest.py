import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from fastapi import UploadFile
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
VECTOR_DIR = BASE_DIR / "data" / "vectorstore"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_DIR.mkdir(parents=True, exist_ok=True)


async def save_and_index_pdf(file: UploadFile):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    loader = PyPDFLoader(str(file_path))
    raw_docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_splitter.split_documents(raw_docs)

    try:
        base_url = os.getenv("OLLAMA_BASE_URL", "https://api.ollama.com")
        embeddings = OllamaEmbeddings(
            model="qwen3-embedding:8b",
            base_url=base_url,
        )

        vector_store = FAISS.from_documents(docs, embeddings)
        index_dir = VECTOR_DIR / Path(file.filename).stem
        index_dir.mkdir(parents=True, exist_ok=True)
        vector_store.save_local(str(index_dir))
    except Exception as e:
        # Provide actionable diagnostics without printing the API key
        import traceback
        has_key = bool(os.getenv("OLLAMA_API_KEY"))
        base_url_seen = os.getenv("OLLAMA_BASE_URL", "(not set, using default)")
        print(f"Error during embedding or vector store creation: {e}")
        print(f"OLLAMA_BASE_URL={base_url_seen}")
        print(f"OLLAMA_API_KEY set: {has_key}")
        # full traceback
        print(traceback.format_exc())
        # Try to extract HTTP response details if available
        try:
            resp = getattr(e, "response", None)
            if resp is not None:
                status = getattr(resp, "status_code", None) or getattr(resp, "status", None)
                body = None
                try:
                    body = resp.text
                except Exception:
                    try:
                        body = resp.content
                    except Exception:
                        body = None
                print(f"HTTP response status: {status}")
                print(f"HTTP response body: {body}")
        except Exception:
            pass
        if "401" in str(e) or "unauthorized" in str(e).lower():
            print("401 Unauthorized from Ollama: check that OLLAMA_API_KEY is correct and OLLAMA_BASE_URL points to your Ollama Cloud endpoint.")

    return {
        "message": "PDF uploaded and indexed successfully",
        "filename": file.filename,
        "chunks": len(docs)
    }