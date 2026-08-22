import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.exceptions.errors import AppError, ErrorCode, PUBLIC_MESSAGE

logger = logging.getLogger(__name__)


def _payload(request: Request, code: ErrorCode, message: str, details: dict | None = None) -> dict:
    request_id = getattr(request.state, "request_id", "unknown")
    body: dict = {
        "success": False,
        "error": {
            "code": str(code),
            "message": message,
            "request_id": request_id,
        },
    }
    if details:
        body["error"]["details"] = details
    return body


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        logger.warning(
            "app_error",
            extra={
                "request_id": getattr(request.state, "request_id", "unknown"),
                "error_code": str(exc.code),
            },
        )
        return JSONResponse(status_code=exc.status_code, content=_payload(request, exc.code, exc.message, exc.details))

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        details = {"errors": exc.errors()}
        return JSONResponse(
            status_code=422,
            content=_payload(
                request,
                ErrorCode.VALIDATION_ERROR,
                PUBLIC_MESSAGE[ErrorCode.VALIDATION_ERROR],
                details,
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = ErrorCode.INTERNAL_ERROR
        if exc.status_code == 404:
            code = ErrorCode.CREDIT_NOT_FOUND
            message = exc.detail if isinstance(exc.detail, str) else PUBLIC_MESSAGE[code]
        elif exc.status_code == 429:
            code = ErrorCode.RATE_LIMITED
            message = PUBLIC_MESSAGE[code]
        else:
            message = exc.detail if isinstance(exc.detail, str) else PUBLIC_MESSAGE[code]
        return JSONResponse(status_code=exc.status_code, content=_payload(request, code, message))

    @app.exception_handler(SQLAlchemyError)
    async def db_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.exception(
            "database_error",
            extra={"request_id": getattr(request.state, "request_id", "unknown")},
        )
        return JSONResponse(
            status_code=503,
            content=_payload(request, ErrorCode.DATABASE_UNAVAILABLE, PUBLIC_MESSAGE[ErrorCode.DATABASE_UNAVAILABLE]),
        )

    @app.exception_handler(TimeoutError)
    async def timeout_handler(request: Request, exc: TimeoutError) -> JSONResponse:
        logger.warning(
            "timeout",
            extra={"request_id": getattr(request.state, "request_id", "unknown")},
        )
        return JSONResponse(
            status_code=504,
            content=_payload(request, ErrorCode.TIMEOUT, PUBLIC_MESSAGE[ErrorCode.TIMEOUT]),
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_error")

        return JSONResponse(
            status_code=500,
            content=_payload(request, ErrorCode.INTERNAL_ERROR, PUBLIC_MESSAGE[ErrorCode.INTERNAL_ERROR]),
        )
