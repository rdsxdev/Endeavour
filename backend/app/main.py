import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.blockchain.loop import indexer_loop
from app.config import get_settings
from app.exceptions.handlers import register_exception_handlers
from app.logging.setup import configure_logging
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestContextMiddleware
from app.routers.api import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    settings = get_settings()
    stop = asyncio.Event()
    task = None
    if settings.indexer_enabled:
        task = asyncio.create_task(indexer_loop(stop))
    try:
        yield
    finally:
        stop.set()
        if task:
            await task


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version="3.0.0",
        lifespan=lifespan,
    )
    application.add_middleware(RequestContextMiddleware)
    application.add_middleware(RateLimitMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )
    register_exception_handlers(application)
    application.include_router(router)
    return application


app = create_app()
