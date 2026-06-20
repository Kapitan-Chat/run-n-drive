from pathlib import Path
from typing import Annotated, Any

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, Form, File
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import mimetypes

from jose import jwt, JWTError
from urllib.parse import quote

from fastapi.middleware.cors import CORSMiddleware

import utils
import settings
from file_repository import SqliteFileRepository
from file_storage import FolderFileStorage
from models import SaveFileResponse

app = FastAPI()
bearer_scheme = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

file_storage = FolderFileStorage(Path(settings.FILES_DIR))
file_repository = SqliteFileRepository(settings.DB_PATH, file_storage)


async def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORYTHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={'error': "Invalid or expired token"},
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.post('/api/file/', response_model=SaveFileResponse)
async def save_file(payload: Annotated[dict[str, Any], Depends(verify_jwt)], file: Annotated[UploadFile, File()], hash: Annotated[str, Form()]) -> SaveFileResponse:
    local_file = file_repository.get_by_hash(hash)
    if local_file:
        return SaveFileResponse(id=local_file.id, hash=local_file.hash, is_new=False)
    local_file = file_repository.save(await file_storage.save(file.file, file.filename))
    return SaveFileResponse(id=local_file.id, hash=local_file.hash, is_new=True)


@app.get('/api/file/')
async def get_file(hash: str | None = None, id: str | None = None, file_name: str | None = None) -> StreamingResponse:
    if hash:
        local_file = file_repository.get_by_hash(hash)
    elif id:
        local_file = file_repository.get_by_id(id)
    else:
        raise HTTPException(status_code=422, detail={"error": "Missing hash or id from query"})

    if not local_file:
        raise HTTPException(status_code=404, detail={"error": "File not found", "provided_data": {"id": id, "hash": hash}})

    mime_type, _ = mimetypes.guess_type(local_file.original_name)
    if not mime_type:
        mime_type = "application/octet-stream"

    return StreamingResponse(
        content=local_file.read(),
        media_type=mime_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(file_name if file_name else local_file.original_name)}"}
    )


if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)