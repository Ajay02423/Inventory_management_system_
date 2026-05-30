from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class APIError(Exception):
    status_code: int
    detail: str
    code: str

    def __str__(self) -> str:
        return f"{self.code}: {self.detail}"
