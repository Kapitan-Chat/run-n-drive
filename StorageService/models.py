from io import BufferedReader

from pydantic import BaseModel


class SaveFileResponse(BaseModel):
    is_new: bool
    id: str
    hash: str



class StoredFile:
    id: str
    hash: str
    original_name: str

    def __init__(self, _id: str, _hash: str, original_name: str, _file_storage):
        self.id = _id
        self.hash = _hash
        self.original_name = original_name
        self._file_storage = _file_storage

    def read(self) -> BufferedReader | None:
        return self._file_storage.get(self.id)