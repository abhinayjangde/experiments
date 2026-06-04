from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/products")
def read_products():
    return {"products": ["product1", "product2", "product3"]}