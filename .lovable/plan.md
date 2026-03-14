

# Fix Password Reset Redirect

## Investigation Results

**`redirectTo` is already correctly set** in `src/components/auth/AuthModal.tsx` line 160-161. This is not the issue.

The real problem is in `src/pages/ResetPassword.tsx` — the `checkSession()` call on line 53 runs immediately, before Supabase has time to exchange the hash tokens from the URL. This causes a race condition where:
1. Page loads with recovery tokens in the URL hash
2. `checkSession()` runs instantly — no session exists yet (Supabase hasn't processed the hash)
3. 5-second timeout fires → shows "error" state
4. Meanwhile, `PASSWORD_RECOVERY` event may fire too late or not at all

## Fix: `src/pages/ResetPassword.tsx` (lines 31-56)

Add a 1-second delay before calling `checkSession()` to let Supabase process the URL hash tokens first. Also check for hash presence to avoid premature error state:

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      setStatus("ready");
    }
  });

  const hash = window.location.hash;
  const hasRecoveryToken = hash && (hash.includes("type=recovery") || hash.includes("access_token"));

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setStatus("ready");
    } else if (!hasRecoveryToken) {
      // No token in URL and no session — invalid link
      setStatus("error");
    } else {
      // Token exists but session not yet exchanged — wait longer
      setTimeout(() => {
        setStatus((prev) => (prev === "loading" ? "error" : prev));
      }, 5000);
    }
  };

  // Delay to let Supabase auto-exchange hash tokens
  setTimeout(checkSession, 1000);

  return () => subscription.unsubscribe();
}, []);
```

Key changes:
- **1-second delay** before `checkSession()` — gives Supabase time to process the hash
- **Check for recovery tokens in URL** — if no tokens and no session, show error immediately instead of waiting 5 seconds
- **Removed redundant `type=recovery` hash check** inside `checkSession` — simplified to just check session existence
- Route already exists correctly in `App.tsx` (line 40) and is not behind any auth guard

No other files need changes.

