---
name: Orval and Zod compatibility
description: OpenAPI numeric schema compatibility in this workspace's generated Zod client
---

When adding OpenAPI contracts, prefer `type: number` for numeric identifiers and counts rather than `type: integer`.

**Why:** The installed Orval/Zod generation path emits `zod.int()` for OpenAPI integers, but this workspace currently resolves Zod 3, which has no `zod.int()` API and breaks the generated library typecheck.

**How to apply:** After changing `lib/api-spec/openapi.yaml`, run codegen and the library typecheck before using generated hooks or schemas.