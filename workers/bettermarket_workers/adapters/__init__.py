from .base import Adapter
from .demo import DemoAdapter

# Register new sources here; the CLI looks adapters up by name.
ADAPTERS: dict[str, type[Adapter]] = {a.name: a for a in (DemoAdapter,)}


def get_adapter(name: str) -> Adapter:
    try:
        return ADAPTERS[name]()
    except KeyError:
        raise SystemExit(f"unknown adapter {name!r}; available: {', '.join(ADAPTERS)}") from None
