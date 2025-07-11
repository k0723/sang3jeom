from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import shutil
import uuid
import os
import requests
from dotenv import load_dotenv
import replicate
import boto3
from botocore.exceptions import NoCredentialsError
import re

load_dotenv()

HF_API_URL = os.getenv("HF_API_URL")
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

HF_HEADERS = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

# Replicate 기반 이미지 변환 함수
def call_replicate_flux_kontext(image_url: str, prompt: str) -> str:
    output = replicate.run(
        "black-forest-labs/flux-kontext-pro",
        input={
            "prompt": prompt,
            "input_image": image_url,
            "output_format": "jpg"
        }
    )
    # output은 결과 이미지 URL
    if isinstance(output, list):
        return output[0]
    return output

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
S3_BUCKET = os.getenv("S3_BUCKET")
S3_REGION = os.getenv("S3_REGION", "ap-northeast-2")  # 서울 리전 예시

def upload_to_s3(file_path, filename):
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=S3_REGION,
    )
    try:
        s3.upload_file(file_path, S3_BUCKET, filename, ExtraArgs={"ACL": "public-read"})
        url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{filename}"
        return url
    except NoCredentialsError:
        print("AWS 자격증명 오류")
        return None

@app.post("/generate-character")
async def generate_character(
    image: UploadFile = File(...),
    style: str = Form(...)
):
    file_id = str(uuid.uuid4())
    safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', image.filename)
    filename = f"{file_id}_{safe_filename}"
    image_path = os.path.join(UPLOAD_DIR, filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # S3에 업로드
    image_url = upload_to_s3(image_path, filename)
    prompt = f"make the pet look like a cute {style} character"
    result_url = call_replicate_flux_kontext(image_url, prompt)

    return JSONResponse({
        "result_url": str(result_url)
    })
