"""Generate SQL for new approved labels after editing src/data/tags.json."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def seed_sql():
    catalog = json.loads((ROOT / "zoart-a-project/src/data/tags.json").read_text())
    labels = [entry["label"] for entry in catalog]
    if len(set(labels)) != len(labels):
        raise ValueError("Duplicate tag labels")
    values = ",\n".join("  ('" + label.replace("'", "''") + "')" for label in labels)
    return "insert into public.project_tag_catalog(label) values\n" + values + "\non conflict do nothing;"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default="supabase/tag-catalog.sql")
    args = parser.parse_args()
    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(seed_sql() + "\n", encoding="utf-8")
    print(f"Tag SQL saved to {output}")
