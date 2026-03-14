

# Fix Password Recovery — Stop Auto-Login on Reset Link

## Problem
The `AuthContext.tsx` listener on line 30 handles ALL auth events identically — it sets the user from the session regardless of whether it's a `PASSWORD_RECOVERY` or `SIGNED_IN` event. When the recovery token is exchanged, a session is created and the user appears "logged in" throughout the app, potentially triggering redirects away from `/reset-password`.

## Changes

### 1. `src/contexts/AuthContext.tsx` — Intercept PASSWORD_RECOVERY event

Update the `onAuthStateChange` listener (line 30) to detect `PASSWORD_RECOVERY` and redirect to `/reset-password` instead of setting the user as logged in:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    // Don't set user — redirect to reset page
    if (window.location.pathname !== "/reset-password") {
      window.location.href = "/reset-password";
    }
    return;
  }
  setUser(session?.user ?? null);
  setLoading(false);
});
```

Also add an early URL hash check at the start of the `useEffect` (before the listener) to catch `type=recovery` in the URL and redirect immediately:

```typescript
const hash = window.location.hash;
if (hash && hash.includes("type=recovery") && window.location.pathname !== "/reset-password") {
  window.location.href = "/reset-password" + window.location.hash;
  return; // skip setting up listener — page will reload
}
```

### 2. `src/pages/ResetPassword.tsx` — Handle already-exchanged session

Update the `useEffect` (line 31-58) to increase the initial delay from 1000ms to 500ms for the session check since the token may already be exchanged by the time the page loads, and extend the fallback timeout to 8000ms for slower connections:

- Change `setTimeout(checkSession, 1000)` → `setTimeout(checkSession, 500)` (session is likely already active from the redirect)
- Change the inner timeout from 5000 → 8000ms for the "no session yet" case

No other files need changes — there are no auth guards or protected routes in this app.

