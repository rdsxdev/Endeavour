import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import get_settings
from app.exceptions.errors import ErrorCode, PUBLIC_MESSAGE

MUTATING_PREFIXES = ("/credits", "/transactions", "/wallets")


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app) -> None:
        super().__init__(app)
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._redis = None
        settings = get_settings()
        if settings.redis_url:
            try:
                import redis

                self._redis = redis.Redis.from_url(settings.redis_url, decode_responses=True)
            except Exception:
                self._redis = None

    async def dispatch(self, request: Request, call_next):
        settings = get_settings()
        if not settings.rate_limit_enabled:
            return await call_next(request)
        if request.method == "GET" and request.url.path in {"/health", "/ready", "/"}:
            return await call_next(request)

        window = settings.rate_limit_window_seconds
        limit = settings.rate_limit_requests
        if request.method in {"POST", "PUT", "PATCH", "DELETE"} or request.url.path.startswith(
            MUTATING_PREFIXES
        ):
            limit = max(10, limit // 3)

        client = request.client.host if request.client else "unknown"
        key = f"{client}:{request.url.path}:{request.method}"
        if self._allow(key, limit, window):
            return await call_next(request)

        request_id = getattr(request.state, "request_id", "unknown")
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "error": {
                    "code": ErrorCode.RATE_LIMITED,
                    "message": PUBLIC_MESSAGE[ErrorCode.RATE_LIMITED],
                    "request_id": request_id,
                },
            },
            headers={"Retry-After": str(window), "X-Request-ID": request_id},
        )

    def _allow(self, key: str, limit: int, window: int) -> bool:
        if self._redis is not None:
            redis_key = f"rl:{key}"
            count = self._redis.incr(redis_key)
            if count == 1:
                self._redis.expire(redis_key, window)
            return int(count) <= limit

        now = time.time()
        bucket = self._hits[key]
        while bucket and now - bucket[0] > window:
            bucket.popleft()
        if len(bucket) >= limit:
            return False
        bucket.append(now)
        return True
