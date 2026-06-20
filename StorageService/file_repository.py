import sqlite3
from abc import ABC, abstractmethod

from file_storage import FileStorage
from models import StoredFile


class FileRepository(ABC):
    @abstractmethod
    def get_by_hash(self, hash_str: str) -> StoredFile | None:
        pass

    @abstractmethod
    def get_by_id(self, _id: str) -> StoredFile | None:
        pass

    @abstractmethod
    def get_by_original_name(self, original_name: str) -> list[StoredFile]:
        pass

    @abstractmethod
    def save(self, file: StoredFile) -> StoredFile:
        pass


class SqliteFileRepository(FileRepository):
    def __init__(self, db_name: str, _file_storage: FileStorage):
        self._db_name = db_name
        self._file_storage = _file_storage
        self._conn = sqlite3.connect(self._db_name)

        self._conn.execute(
            "CREATE TABLE IF NOT EXISTS files ("
            "id CHAR(255) PRIMARY KEY, "
            "hash CHAR(255) NOT NULL UNIQUE, "
            "original_name CHAR(255) NOT NULL"
            ")"
        )

    def get_by_hash(self, hash_str: str) -> StoredFile | None:
        cur = self._conn.execute("SELECT * FROM files WHERE hash = ?", [hash_str])
        row = cur.fetchone()
        if not row: return None
        _id, _hash, orig_name = row

        return StoredFile(_id, _hash, orig_name, self._file_storage)

    def get_by_id(self, _id: str) -> StoredFile | None:
        cur = self._conn.execute("SELECT * FROM files WHERE id = ?", [_id])
        row = cur.fetchone()
        if not row: return None
        _id, _hash, orig_name = row

        return StoredFile(_id, _hash, orig_name, self._file_storage)

    def get_by_original_name(self, original_name: str) -> list[StoredFile]:
        cur = self._conn.execute("SELECT * FROM files WHERE original_name = ?", [original_name])
        results = list()
        for row in cur.fetchall():
            _id, _hash, orig_name = row
            results.append(StoredFile(_id, _hash, orig_name, self._file_storage))

        return results

    def save(self, file: StoredFile) -> StoredFile:
        cur = self._conn.cursor()
        cur.execute("INSERT INTO files VALUES (?, ?, ?)", [file.id, file.hash, file.original_name])
        cur.connection.commit()
        return file
