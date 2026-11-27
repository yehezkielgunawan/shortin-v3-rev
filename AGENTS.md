Shortin App Specs

---

# AGENTS.md

## URL Shortener (Hono + Tailwind)

A minimalist, responsive, and accessible URL shortener service built with **Hono JS** and **Tailwind CSS**. This project utilize `pnpm` as the package manager.
It proxies requests to the real API endpoint (`API_ENDPOINT=https://shortin-api.yehezgun.com/`) through custom routes under `/api`. Use Context7 to get the technical documentation data context.

---

## Stack

* **Hono JS** for backend + routing
* **Tailwind CSS** for responsive UI (light theme)
* **hono/jsx** & **hono/jsx/dom** for client interactivity (no extra deps, maximize the JSX usage for client component manipulation, instead of vanilla JS)
* **hono/validator** for request validation
* **hono/adapter** for env variables
* **pnpm** as package manager

---

## Routes

### Web Routes

* **`GET /`**
  Main page with form to input long URL and optional custom code.

* **`GET /:code`**
  Loading screen (~2s) → redirect to original URL.

---

### API Proxy Routes (`/api/*`)

Proxy to real API endpoint defined in `API_ENDPOINT`.

---

#### **POST /api/shorten** → Create Short URL

**Request Body**

```json
{
  "url": "https://www.example.com/some/long/url",
  "shortCodeInput": "custom" // optional - if empty, a random 6-character code will be generated
}
```

**Response (201)**

```json
{
  "id": "id_1620000000000_1234",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "custom", // or randomly generated code like "aB3xYz"
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "count": 0
}
```

**Error (400)**

```json
{ "error": "URL is required" }
```

```json
{ "error": "Short code already in use" }
```

* If short code exists but is older than **3 months** → return warning to allow override.

---

#### **GET /api/:code** → Get Original URL

**Response (200)**

```json
{
  "url": "https://www.example.com/some/long/url"
}
```

**Error (404)**

```json
{ "error": "Short code not found" }
```

---

#### **GET /api/:code/stats** → Get Visit Stats

**Response (200)**

```json
{
  "count": 42
}
```

**Error (404)**

```json
{ "error": "Short code not found" }
```

---

#### **PUT /api/:code** → Update Destination URL

**Request Body**

```json
{
  "url": "https://www.example.com/new/url"
}
```

**Response (200)**

```json
{ "message": "Short code updated successfully" }
```

**Error (404)**

```json
{ "error": "Short code not found" }
```

---

#### **DELETE /api/:code** → Delete Short URL

**Response (200)**

```json
{ "message": "Short code deleted successfully" }
```

**Error (404)**

```json
{ "error": "Short code not found" }
```

---

## Features

1. Input form for long URL (+ optional custom short code).
2. **Random short code generation** - If no custom code is provided, a random 6-character alphanumeric code is generated automatically.
3. Validation (must be valid URL).
4. Error handling:

   * Short code exists → show error.
   * If older than 3 months → warn but allow override.
5. Copy-to-clipboard for generated short URL.
6. Responsive light theme with Tailwind.
7. Accessible (a11y compliant).
8. Simple 3-second loading screen before redirect.

---

## UI Wireframes

### Main Page (`/`)

```
+-------------------------------------------------------+
|  URL Shortener                                        |
|-------------------------------------------------------|
|  Enter Long URL:  [ https://example.com/long/url   ]  |
|                                                       |
|  Custom Short Code (optional): [ custom123 ]          |
|                                                       |
|  [ Shorten URL ]                                      |
|                                                       |
|-------------------------------------------------------|
|  Result:                                              |
|  Short URL: https://yourdomain.com/custom123          |
|  [ Copy ]                                             |
|                                                       |
|  ⚠ Warning: This short code exists but is >3 months   |
|    old. You may override it.                          |
+-------------------------------------------------------+
```

### Loading / Redirect (`/r/:code`)

```
+-------------------------------------------------------+
|  Redirecting...                                       |
|                                                       |
|  Please wait while we take you to your destination.   |
|                                                       |
|  [3s Spinner/Animation here]                          |
+-------------------------------------------------------+
```

### Error State

```
+-------------------------------------------------------+
|  ❌ Error                                              |
|                                                       |
|  - Invalid URL format                                 |
|  - Short code already in use (choose another)         |
+-------------------------------------------------------+
```

---

use context7 and sequential-thinking as your main reference mcp and docs.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
