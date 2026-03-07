

# Rebuild AuthModal + Replace Favicon/Logo with IKON Branding

## Overview
Two tasks: (1) rebuild AuthModal to be production-ready with all requested UX improvements, (2) replace favicon and any Lovable branding with the uploaded IKON logo.

## 1. AuthModal Rebuild (`src/components/auth/AuthModal.tsx`)

**Changes from current implementation:**

- Already defaults to `"login"` mode -- confirmed correct
- Add `max-h-[85vh] overflow-y-auto` to content wrapper
- Mobile: dialog goes near full-screen (`w-full sm:max-w-md sm:mx-4`)
- Use the IKON logo image (imported from `src/assets/`) at top center instead of the text-based navy box
- Password show/hide toggle already exists -- keep it
- Add **password strength indicator** on signup (weak/medium/strong bar based on length + character variety)
- **Forgot password as inline mode** -- already implemented, keep it
- Better **error message mapping**:
  - "Invalid login credentials" → "Incorrect email or password"
  - "User already registered" → "An account with this email already exists. Try signing in."
  - Network/fetch errors → "Connection error. Please try again."
  - Rate limit errors → "Too many attempts. Please wait a moment."
- After login success: toast shows `"Welcome back, {firstName}!"` using user metadata
- After signup success: toast shows `"Account created! Welcome to IKON Mart"`
- Handle auto-confirmed accounts: if `data.session` exists after signup, close modal immediately; if not, show "Check your email to verify"
- Smooth mode transitions, compact spacing so login fits without scrolling on desktop

## 2. Header Logo Update (`src/components/layout/Header.tsx`)

- Import the IKON logo from `src/assets/` and use an `<img>` tag instead of the navy text box
- Size appropriately (~40px height)

## 3. Favicon + HTML Branding (`index.html`)

- Copy `user-uploads://Untitled_design-6.png` to `public/favicon.png`
- Update `index.html` to reference `/favicon.png` as favicon
- Add `<link rel="icon">` tag
- Remove any existing Lovable favicon references

## 4. Files Changed

| File | Action |
|------|--------|
| `public/favicon.png` | Copy uploaded logo |
| `src/assets/ikon-logo.png` | Copy uploaded logo for component use |
| `index.html` | Add favicon link, remove Lovable refs |
| `src/components/auth/AuthModal.tsx` | Full rebuild with all UX fixes |
| `src/components/layout/Header.tsx` | Use logo image instead of text box |

## 5. Implementation Order
1. Copy logo to `public/favicon.png` and `src/assets/ikon-logo.png`
2. Update `index.html` with favicon
3. Rebuild `AuthModal.tsx`
4. Update `Header.tsx` logo

