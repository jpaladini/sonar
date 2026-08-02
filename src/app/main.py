"""Sonar BFF — FastAPI app serving /api plus the built SPA from src/static."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import chat, data, fixtures
from .store import STORE

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(title="Sonar", docs_url=None, redoc_url=None)


def current_user(request: Request) -> str:
    """Databricks Apps forwards the authenticated user's email."""
    return request.headers.get("X-Forwarded-Email") or "local"


# ------------------------------------------------------------------ health


@app.get("/api/health")
def health() -> dict[str, Any]:
    provider = data.get_provider()
    return {
        "status": "ok",
        "provider": provider.name,
        "delta": {
            "available": data.delta_available(),
            "catalog": data.CATALOG,
            "schema": data.SCHEMA,
        },
        "persistence": STORE.name,
    }


@app.get("/api/bootstrap")
def bootstrap() -> dict[str, Any]:
    return fixtures.deepcopy(fixtures.BOOTSTRAP)


# ------------------------------------------------------------------- chat


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversationId: str | None = None


@app.post("/api/chat")
def post_chat(body: ChatRequest, request: Request) -> dict[str, Any]:
    user = current_user(request)
    query = body.message.strip()
    if not query:
        raise HTTPException(status_code=422, detail="message is empty")

    conv_id = body.conversationId
    created = False
    if conv_id is None or STORE.get_conversation(user, conv_id) is None:
        title = query if len(query) <= 34 else query[:34] + "…"
        conv = STORE.create_conversation(user, title)
        conv_id = conv["id"]
        created = True

    STORE.append_message(user, conv_id, {"isUser": True, "text": query})
    reply = {"isAssistant": True, "blocks": chat.route(query)}
    STORE.append_message(user, conv_id, reply)

    conv = STORE.get_conversation(user, conv_id)
    return {
        "conversationId": conv_id,
        "created": created,
        "title": conv["title"] if conv else "",
        "message": reply,
        "thinkingLabels": fixtures.deepcopy(fixtures.BOOTSTRAP["thinkingLabels"]),
    }


# --------------------------------------------------------- conversations


class ConversationCreate(BaseModel):
    title: str = Field(default="New conversation", max_length=200)
    sub: str = Field(default="just now", max_length=200)


class ConversationPatch(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    sub: str | None = Field(default=None, max_length=200)
    pinned: bool | None = None


@app.get("/api/conversations")
def list_conversations(request: Request) -> list[dict[str, Any]]:
    return STORE.list_conversations(current_user(request))


@app.post("/api/conversations", status_code=201)
def create_conversation(body: ConversationCreate, request: Request) -> dict[str, Any]:
    return STORE.create_conversation(current_user(request), body.title, body.sub)


@app.get("/api/conversations/{conv_id}")
def get_conversation(conv_id: str, request: Request) -> dict[str, Any]:
    conv = STORE.get_conversation(current_user(request), conv_id)
    if conv is None:
        raise HTTPException(status_code=404, detail="conversation not found")
    return conv


@app.patch("/api/conversations/{conv_id}")
def patch_conversation(conv_id: str, body: ConversationPatch,
                       request: Request) -> dict[str, Any]:
    patch = body.model_dump(exclude_none=True)
    conv = STORE.update_conversation(current_user(request), conv_id, patch)
    if conv is None:
        raise HTTPException(status_code=404, detail="conversation not found")
    return conv


@app.delete("/api/conversations/{conv_id}")
def delete_conversation(conv_id: str, request: Request) -> Response:
    if not STORE.delete_conversation(current_user(request), conv_id):
        raise HTTPException(status_code=404, detail="conversation not found")
    return Response(status_code=204)


# ---------------------------------------------------------------- panels


@app.get("/api/report")
def report() -> dict[str, Any]:
    return data.get_provider().report()


@app.get("/api/charts")
def charts() -> dict[str, Any]:
    return data.get_provider().charts()


@app.get("/api/agents")
def agents() -> dict[str, Any]:
    return data.get_provider().agents()


@app.get("/api/transcripts")
def transcripts() -> dict[str, Any]:
    return data.get_provider().transcripts()


@app.get("/api/transcripts/{call_id}")
def transcript(call_id: str) -> dict[str, Any]:
    item = data.get_provider().transcript(call_id)
    if item is None:
        raise HTTPException(status_code=404, detail="transcript not found")
    return item


@app.get("/api/pipeline/health")
def pipeline_health() -> list[dict[str, Any]]:
    return data.get_provider().pipeline_health()


@app.get("/api/prompts")
def labeling_prompts() -> list[dict[str, Any]]:
    return data.get_provider().labeling_prompts()


# ------------------------------------------------------------ saved items


class SavedCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    desc: str = Field(default="", max_length=1000)
    meta: str = Field(default="Saved just now", max_length=200)


@app.get("/api/saved")
def list_saved(request: Request) -> list[dict[str, Any]]:
    return STORE.list_saved(current_user(request))


@app.post("/api/saved", status_code=201)
def create_saved(body: SavedCreate, request: Request) -> dict[str, Any]:
    return STORE.create_saved(current_user(request), body.model_dump())


@app.delete("/api/saved/{item_id}")
def delete_saved(item_id: str, request: Request) -> Response:
    if not STORE.delete_saved(current_user(request), item_id):
        raise HTTPException(status_code=404, detail="saved item not found")
    return Response(status_code=204)


# ---------------------------------------------------------------- static


if (STATIC_DIR / "index.html").is_file():
    if (STATIC_DIR / "assets").is_dir():
        app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"),
                  name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str) -> FileResponse | JSONResponse:
        if path.startswith("api/"):
            return JSONResponse({"detail": "not found"}, status_code=404)
        candidate = (STATIC_DIR / path).resolve()
        if path and candidate.is_file() and STATIC_DIR in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
