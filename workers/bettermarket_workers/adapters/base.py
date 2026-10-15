from abc import ABC, abstractmethod
from collections.abc import Iterable
from typing import Any

from ..models import ListingIn


class Adapter(ABC):
    """One per data source. fetch() gets raw records; normalize() maps one to a ListingIn.

    Keeping the two apart means raw payloads can be stored and re-normalized
    when the mapping improves, without hitting the source again.
    """

    name: str

    @abstractmethod
    def fetch(self) -> Iterable[dict[str, Any]]: ...

    @abstractmethod
    def normalize(self, raw: dict[str, Any]) -> ListingIn | None:
        """Return None to skip a record (e.g. a wanted ad or a malformed row)."""
