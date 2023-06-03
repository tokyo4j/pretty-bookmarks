import uvicorn
from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware
import re
from uuid import uuid4
import json
import os
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
# def read_root(url: str = Form(...), file: UploadFile = File(...)):
async def read_root(request: Request):
    form_data = await request.form()
    index = {}
    dirname = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    os.mkdir(dirname)
    for url, file in form_data.multi_items():
        ext = re.match(r"^image/(\w+)$", file.content_type)[1]
        filename = f"{uuid4()}.{ext}"
        open(f"{dirname}/{filename}", "wb+").write(file.file.read())
        index[url] = filename

    open(f"{dirname}/index.json", "w+").write(json.dumps(index, indent=2))

    return "file saved"


if __name__ == "__main__":
    uvicorn.run(app)
