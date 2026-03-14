

# World-Class Password Reset Flow — Upgrade Plan

## What Already Exists
`src/pages/ResetPassword.tsx` already exists with basic functionality:
- Listens for `PASSWORD_RECOVERY` event and checks URL hash for `type=recovery`
- Simple password form with confirm field
- Basic validation (8 chars, match check)
- Route already registered in `App.tsx`

## What Needs to Change
Upgrade the existing `ResetPassword.tsx` from a basic form to the polished, branded experience described. No new files or routes needed.

## Changes: `src/pages/ResetPassword.tsx` (full rewrite)

### State Machine
Replace the boolean `ready` with a proper status: `"loading" | "ready" | "success" | "error"`
- **loading**: Show spinner + "Verifying your reset link..." with 5-second timeout to error
- **ready**: Full password form with strength indicators
- **success**: Confirmation + auto-redirect countdown
- **error**: Expired link message + "Request New Link" button

### Password Form Enhancements
- Eye/EyeOff toggle for both password fields
- Real-time strength checklist (8+ chars, uppercase, lowercase, number) with green CheckCircle / gray Circle icons
- Passwords-match indicator below confirm field
- Submit button disabled until all rules pass + passwords match
- Loader2 spinner on submit

### Post-Submit Flow
- On success: sign out user, show success state, auto-redirect to "/" after 3 seconds (home page opens auth modal)
- On error: show toast with error message

### Visual Design
- Remove MainLayout wrapper — standalone centered page
- Background: `bg-gradient-to-b from-[#212265]/5 to-background` (subtle navy gradient)
- Centered card: `max-w-md mx-auto`, white, `rounded-xl shadow-lg p-8`
- IKON Mart logo at top of card (import from `src/assets/ikon-logo.png`)
- ShieldCheck icon (amber) for ready state heading
- Navy headings, muted-foreground body text
- Golden amber accent for primary button and icons
- Smooth fade transitions between states

### Auth Event Handling
Keep existing logic but improve:
- `onAuthStateChange` listens for `PASSWORD_RECOVERY` → set ready
- `getSession` fallback checks for existing session → set ready  
- 5-second timeout → set error (if still loading)

No changes to `App.tsx` (route already exists). No changes to `AuthContext.tsx`. No database changes needed.

