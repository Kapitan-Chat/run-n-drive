import hashlib
from abc import ABC, abstractmethod
from io import BufferedReader, BufferedWriter
from pathlib import Path
from typing import BinaryIO, Tuple
from shortuuid import ShortUUID

from models import StoredFile


class FileStorage(ABC):
    @abstractmethod
    async def save(self, file: BinaryIO, file_name: str, file_id: str | None = None) -> StoredFile:
        pass

    @abstractmethod
    def get(self, file_id: str) -> BufferedReader | None:
        pass


class FolderFileStorage(FileStorage):
    def __init__(self, folder: Path, chunk_size: int = 1024 * 1024):
        self.folder = folder
        self.chunk_size = chunk_size
        gen = ShortUUID()
        self._generate_id = lambda: gen.random(16)

        if not folder.exists():
            folder.mkdir(parents=True, exist_ok=True)

    async def __write_chunk(self, writer: BufferedWriter, data: BinaryIO) -> Tuple[bool, bytes | None]:
        bts = data.read(self.chunk_size)
        if len(bts) > 0:
            writer.write(bts)
            return True, bts
        else:
            return False, None

    async def save(self, file: BinaryIO, file_name: str, file_id: str | None = None) -> StoredFile:
        if not file_id: file_id = self._generate_id()
        sha256 = hashlib.sha256()
        with open(self.folder / f"{file_id}", "wb") as f:
            wr = True
            while wr:
                wr, bts = await self.__write_chunk(f, file)
                if wr:
                    sha256.update(bts)

        return StoredFile(file_id, sha256.hexdigest(), file_name, self)

    def get(self, file_id: str) -> BufferedReader | None:
        file_path = self.folder / f"{file_id}"
        if not file_path.exists():
            return None
        return file_path.open("rb")
