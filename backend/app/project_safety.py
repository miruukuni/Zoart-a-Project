"""Shared approved-host policy for public project application links."""
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit

POLICY = json.loads((Path(__file__).resolve().parents[2] / "zoart-a-project/src/data/application-link-policy.json").read_text())


def application_url(value: str | None) -> str | None:
    value = value.strip() if value else None
    if not value:
        return None
    try:
        parsed = urlsplit(value)
        host = (parsed.hostname or "").encode("idna").decode("ascii").lower()
        if (parsed.scheme != "https" or not host or parsed.port not in (None, 443)
                or parsed.username is not None or parsed.password is not None
                or "\\" in value or any(character.isspace() or ord(character) < 32 or ord(character) == 127 for character in value)):
            raise ValueError()
        path = parsed.path or "/"
        if any(unquote(segment) in {".", ".."} for segment in path.split("/")) or "\\" in unquote(path):
            raise ValueError()
        if not any((host == rule["host"] or (rule["subdomains"] and host.endswith("." + rule["host"])))
                   and path.startswith(rule["pathPrefix"]) for rule in POLICY):
            raise ValueError()
        return urlunsplit(("https", host, path, parsed.query, parsed.fragment))
    except (ValueError, UnicodeError) as error:
        raise ValueError("Use an HTTPS link to a UCI site, Google Form, or GitHub project.") from error
