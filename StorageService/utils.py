import hashlib
from typing import BinaryIO


async def calculate_hash(io: BinaryIO, chunk_size: int = 1024 * 1024) -> str:
    sha256 = hashlib.sha256()
    while True:
        read = io.read(chunk_size)
        sha256.update(read)
        if len(read) < chunk_size:
            break
    return sha256.hexdigest()


def reader_to_iterable(reader, chunk_size=1024):
    """Turn a BufferedReader or file-like object into an iterable of bytes chunks."""
    while True:
        chunk = reader.read(chunk_size)
        if not chunk:
            break
        yield chunk