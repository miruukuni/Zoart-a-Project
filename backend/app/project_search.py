"""Catalog-sized query understanding; indexed tag filtering does the retrieval."""
import re
from typing import Annotated
from pydantic import BaseModel, Field

TagGroup = Annotated[list[str], Field(min_length=1, max_length=8)]


class TagSearchPlan(BaseModel):
    groups: list[TagGroup] = Field(default_factory=list, max_length=6)
    excluded_tags: list[str] = Field(default_factory=list, max_length=12)
    match_all: bool = False


def validated_plan(plan: TagSearchPlan, labels: set[str], query: str) -> TagSearchPlan:
    if any(tag not in labels for group in plan.groups for tag in group) or any(tag not in labels for tag in plan.excluded_tags):
        raise ValueError("Search returned a label outside the approved catalog")
    groups = [list(dict.fromkeys(group)) for group in plan.groups]
    excluded = list(dict.fromkeys(plan.excluded_tags))
    # Empty, unrecognized queries must not silently turn into 'show everything'.
    all_requested = bool(re.fullmatch(r"\s*(?:show\s+)?(?:me\s+)?(?:all(?:\s+(?:the\s+)?projects)?|everything|anything)\s*[.!?]?\s*", query, re.I))
    return TagSearchPlan(groups=groups, excluded_tags=excluded, match_all=plan.match_all and all_requested)


def matches_plan(tags: list[str] | None, plan: TagSearchPlan) -> bool:
    selected = set(tags or [])
    if not plan.groups and not plan.excluded_tags and not plan.match_all:
        return False
    return not selected.intersection(plan.excluded_tags) and all(selected.intersection(group) for group in plan.groups)


def plan_summary(plan: TagSearchPlan) -> str:
    if not plan.groups and not plan.excluded_tags and not plan.match_all:
        return "No approved tag matches this request. Try a different topic or select a category."
    included = " AND ".join("(" + " OR ".join(group) + ")" if len(group) > 1 else group[0] for group in plan.groups)
    return "Matching tags: " + (included or "all projects") + ("; excluding " + ", ".join(plan.excluded_tags) if plan.excluded_tags else "") + "."


def fallback_plan(query: str, catalog: list[dict], typo_resolver) -> TagSearchPlan:
    occurrences = []
    for entry in catalog:
        for alias in [entry["label"], *entry["aliases"]]:
            if alias.lower() == "go" and query.strip().lower() != "go" and not re.search(r"\b(?:golang|programming)\b", query, re.I):
                continue
            for match in re.finditer(rf"(?<!\w){re.escape(alias)}(?!\w)", query, re.I):
                occurrences.append((match.start(), match.end(), entry["label"]))
    occurrences.sort(key=lambda match: (match[0], -(match[1] - match[0])))
    matches, end = [], -1
    for match in occurrences:
        if match[0] >= end:
            matches.append(match); end = match[1]
    groups, excluded = [], []
    previous_end = 0
    for start, end, label in matches:
        clause = re.split(r"\b(?:but|using|with|and)\b", query[:start], flags=re.I)[-1]
        negative = bool(re.search(r"\b(?:not|without|excluding|exclude|no)\b", clause, re.I))
        if negative:
            if label not in excluded: excluded.append(label)
            continue
        if any(label in group for group in groups):
            continue
        connector = query[previous_end:start]
        if groups and re.search(r"\bor\b", connector, re.I) and not re.search(r"\b(?:and|using|with|but)\b", connector, re.I):
            groups[-1].append(label)
        else:
            groups.append([label])
        previous_end = end
    if not groups and not excluded:
        typo = typo_resolver(query)
        if typo: groups = [[typo]]
    return validated_plan(TagSearchPlan(groups=[group[:8] for group in groups[:6]], excluded_tags=excluded[:12], match_all=True), {entry["label"] for entry in catalog}, query)
