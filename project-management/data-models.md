# Data Models

> **Phase 1 (MVP) schema – focused on speed, minimal storage, and single-user ownership**  
> Supabase Auth (`auth.users`) is the sole source of truth for identity; therefore no additional `users` table is created.

---

## 1. `documents`

| Column | Type | Constraints | Purpose |
| ------ | ---- | ----------- | ------- |
| `user_id` | `uuid` | `NOT NULL` → FK `auth.users(id)` | Owner of the document |
| `number` | `int` | `NOT NULL` (assigned by `get_next_document_number()`); part of PK | Human-friendly per-user ID (e.g. `/doc/42`) |
| `title` | `text` | `DEFAULT 'Untitled'` | Display name (editable) |
| `content` | `text` | `DEFAULT ''` | Document body |
| `reference_numbers` | `INTEGER[]` | `DEFAULT '{}'` | Links to other docs owned by same user |
| `created_at` | `timestamptz` | `DEFAULT now()` | First save timestamp |
| `updated_at` | `timestamptz` | `DEFAULT now()`; auto-updated via trigger | Last modification |

**Primary Key**: `(user_id, number)`  
**Indices**: `(user_id, updated_at DESC)` for dashboard listing; `GIN(reference_numbers)` for reverse-lookup.

### Why no `uuid` column?
* The app will not share or collaborate on documents; a composite PK plus per-user `number` is sufficient and keeps URLs clean.

---

## 2. `suggestions`  (LLM-generated only)

| Column | Type | Constraints | Purpose |
| ------ | ---- | ----------- | ------- |
| `id` | `uuid` | PK, `DEFAULT gen_random_uuid()` | Unique suggestion ID |
| `user_id` | `uuid` | `NOT NULL` → FK `auth.users(id)` | Owner |
| `document_number` | `int` | `NOT NULL` | Which doc the suggestion belongs to |
| `suggestion_type` | `text` | `NOT NULL` | e.g. `rewrite`, `tone`, `cta` |
| `range_start` | `int` | `NOT NULL` | Character offset of first affected char |
| `range_end` | `int` | `NOT NULL` | Offset of last affected char |
| `message` | `text` | `NOT NULL` | Human-readable description |
| `proposed_text` | `text` | nullable | Replacement / insertion text |
| `engine` | `text` | nullable | LLM model name (`gpt-4o`, `claude-3`) |
| `content_hash` | `text` | `NOT NULL` | SHA-256 of doc content used in the prompt; enables cache invalidation |
| `accepted` | `boolean` | nullable | `true`: applied, `false`: ignored, `null`: pending |
| `created_at` | `timestamptz` | `DEFAULT now()` | Audit / ordering |

**Index**: `(user_id, document_number)` for fast retrieval on editor load.

**Cache invalidation rule**: Discard a suggestion if `sha256(current_content) ≠ content_hash`.

---

## 3. Omitted Tables

| Table | Reason |
| ----- | ------ |
| `users` | Supabase provides `auth.users`. Additional profile data can live in a future `profiles` table if needed. |
| `revisions` | The product philosophy is "write → send → forget." Undo/redo is handled client-side; the server keeps only the latest copy. |
| Deterministic `spell/grammar` suggestions | They are cheap to recompute on the fly; persisting them would only add latency. |

---

## 4. Row-Level Security (RLS) Snippets

```sql
-- Documents: owner-only access
CREATE POLICY user_can_manage_docs
    ON public.documents
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- LLM suggestions: owner-only access
CREATE POLICY user_can_manage_suggestions
    ON public.suggestions
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

---

## 5. Migration Checklist

1. Modify existing `20250620110000_user_scoped_documents.sql` to **remove** `uuid`, `reference_documents`, etc., and align column names with this doc.
2. Create new migration for `public.suggestions` table plus RLS.
3. Ensure trigger `handle_updated_at` is still attached to `documents`.
4. Regenerate Supabase types (run `npx supabase gen types typescript ...`).

---

## 6. Front-End Integration Notes

1. Creating a doc: call RPC `create_document(user_id, content)` and navigate to `/doc/{number}`.
2. Loading a doc: fetch document; then query `/suggestions?document_number=eq.{number}&user_id=eq.{auth.uid()}`.  
   • If no matches or stale `content_hash`, call LLM → persist new suggestions.
3. Undo/redo: implement local history stack (e.g. Slate.js `History` plugin); optional persistence in `localStorage`.

---

This file captures the minimal yet future-proof data model for the MVP. Update it in tandem with any schema changes to keep the team aligned. 
