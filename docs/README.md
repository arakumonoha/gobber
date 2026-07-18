# Gobber — Portable Documentation

This folder is the self-contained spec of the app. Every file uses a standard
format (Markdown, SQL, CSS) — no Lovable-only schemas, no proprietary
manifests. You can host the app anywhere on the strength of these five docs
plus the source tree.

| File                                       | What it is                                     |
| ------------------------------------------ | ---------------------------------------------- |
| [`../SELF_HOSTING.md`](../SELF_HOSTING.md) | End-to-end deploy guide.                       |
| [`../.env.example`](../.env.example)       | Environment variable template.                 |
| [`SCHEMA.sql`](SCHEMA.sql)                 | Full Postgres schema, RLS, triggers, grants.   |
| [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md)     | Palette, type, glass, motion — portable CSS.   |
| [`API.md`](API.md)                         | Server functions, REST resources, realtime.    |
| [`USER_DATA_MODEL.md`](USER_DATA_MODEL.md) | Identity, ownership, RLS semantics.            |
