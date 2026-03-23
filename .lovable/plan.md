

# Fix: Remove Hardcoded Import Secret from AdminImport.tsx

## Problem
Line 20 has `useState("ikon-import-2026")` — the import API key is visible in the client bundle. Security scan flagged this as a hardcoded credential.

## Important Note
Using `VITE_` prefixed env vars does NOT truly hide the secret — Vite inlines them into the client bundle at build time, so they're still visible in browser DevTools. However, it's still better than a hardcoded default because:
- The value isn't committed to source code
- It can be rotated without code changes

## Change — `src/pages/AdminImport.tsx`

**Line 20**: Replace hardcoded default with empty string, and read from env var as a pre-fill hint:

```tsx
const [apiKey, setApiKey] = useState(import.meta.env.VITE_IMPORT_SECRET || "");
```

This single line change removes the hardcoded credential. The input field still lets the admin paste/type the key manually if the env var isn't set.

## Environment Variable
The user should set `VITE_IMPORT_SECRET` in the project's `.env` file or Lovable environment settings with a strong random value, and rotate the corresponding `IMPORT_SECRET` in Supabase Edge Function secrets to match.

