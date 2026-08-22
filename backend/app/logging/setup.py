import logging
import sys

from app.config import get_settings

SECRET_KEYS = ("private_key", "authorization", "password", "secret", "api_key", "token")


class SecretFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage().lower()
        for key in SECRET_KEYS:
            if key in message and "0x" in message:
                record.msg = "[redacted log line containing a possible secret]"
                record.args = ()
                break
        return True


def configure_logging() -> None:
    settings = get_settings()
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(SecretFilter())
    if settings.log_json:
        formatter = logging.Formatter(
            '{"level":"%(levelname)s","logger":"%(name)s","message":"%(message)s",'
            '"request_id":"%(request_id)s"}'
        )
    else:
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(settings.log_level.upper())

    old_factory = logging.getLogRecordFactory()

    def record_factory(*args, **kwargs):  # type: ignore[no-untyped-def]
        record = old_factory(*args, **kwargs)
        if not hasattr(record, "request_id"):
            record.request_id = getattr(record, "request_id", "-")
        extras = getattr(record, "__dict__", {})
        record.request_id = extras.get("request_id", record.request_id)
        return record

    logging.setLogRecordFactory(record_factory)
