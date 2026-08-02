"""Per-user app state: conversations and saved items.

v1 keeps state in-memory (the dev workspace has no gold schema yet); the seam
is the ``StateStore`` interface so a Delta-backed implementation can slot in
without touching the API layer. Every user starts from the design seed so the
app always demos fully populated.
"""

from __future__ import annotations

import itertools
import threading
from typing import Any

from . import fixtures


class StateStore:
    """In-memory, per-user, seeded. Swap for Delta app-state in production."""

    name = "memory"

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._users: dict[str, dict[str, Any]] = {}
        self._counter = itertools.count(1)

    def _user(self, user: str) -> dict[str, Any]:
        with self._lock:
            if user not in self._users:
                self._users[user] = {
                    "convs": fixtures.deepcopy(fixtures.SEED_CONVERSATIONS),
                    "order": list(fixtures.SEED_CONVERSATIONS.keys()),
                    "saved": fixtures.deepcopy(fixtures.SAVED_ITEMS),
                }
            return self._users[user]

    # -- conversations ----------------------------------------------------

    def list_conversations(self, user: str) -> list[dict[str, Any]]:
        state = self._user(user)
        return [
            {"id": cid, **{k: v for k, v in state["convs"][cid].items()
                           if k != "messages"},
             "messageCount": len(state["convs"][cid]["messages"])}
            for cid in state["order"] if cid in state["convs"]
        ]

    def get_conversation(self, user: str, conv_id: str) -> dict[str, Any] | None:
        conv = self._user(user)["convs"].get(conv_id)
        if conv is None:
            return None
        return {"id": conv_id, **conv}

    def create_conversation(self, user: str, title: str, sub: str = "just now",
                            when: str = "today") -> dict[str, Any]:
        state = self._user(user)
        conv_id = f"n{next(self._counter)}"
        state["convs"][conv_id] = {"title": title, "sub": sub, "when": when,
                                   "pinned": False, "messages": []}
        state["order"].insert(0, conv_id)
        return {"id": conv_id, **state["convs"][conv_id]}

    def update_conversation(self, user: str, conv_id: str,
                            patch: dict[str, Any]) -> dict[str, Any] | None:
        state = self._user(user)
        conv = state["convs"].get(conv_id)
        if conv is None:
            return None
        for key in ("title", "sub", "pinned"):
            if key in patch:
                conv[key] = patch[key]
        return {"id": conv_id, **conv}

    def delete_conversation(self, user: str, conv_id: str) -> bool:
        state = self._user(user)
        if conv_id not in state["convs"]:
            return False
        del state["convs"][conv_id]
        state["order"] = [c for c in state["order"] if c != conv_id]
        return True

    def append_message(self, user: str, conv_id: str,
                       message: dict[str, Any]) -> None:
        conv = self._user(user)["convs"][conv_id]
        conv["messages"].append(message)

    # -- saved items ------------------------------------------------------

    def list_saved(self, user: str) -> list[dict[str, Any]]:
        return fixtures.deepcopy(self._user(user)["saved"])

    def create_saved(self, user: str, item: dict[str, Any]) -> dict[str, Any]:
        state = self._user(user)
        new = {
            "id": f"s{next(self._counter)}",
            "title": item.get("title", "Untitled"),
            "desc": item.get("desc", ""),
            "meta": item.get("meta", "Saved just now"),
        }
        state["saved"].insert(0, new)
        return fixtures.deepcopy(new)

    def delete_saved(self, user: str, item_id: str) -> bool:
        state = self._user(user)
        before = len(state["saved"])
        state["saved"] = [s for s in state["saved"] if s["id"] != item_id]
        return len(state["saved"]) < before


STORE = StateStore()
