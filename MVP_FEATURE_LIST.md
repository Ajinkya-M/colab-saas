This will be the **official MVP feature list** for your Creator–Brand collaboration SaaS, based on everything we discussed:

* OAuth login for brands
* Creator dashboard
* Inquiry → Deal pipeline
* Supabase backend
* Next.js frontend
* Minimal friction for brands
* Secure DB with RLS

This list is written like a **real MVP feature spec**, not ideas.

---

# 🎯 MVP GOAL

Build a system where:

* Creators can track brand collaborations in a pipeline
* Brands can send inquiries with Google/Meta login only
* Inquiry becomes deal
* Creator manages deal lifecycle

No teams, no payments, no notifications yet.

---

# 🧱 FEATURE LIST (MVP SCOPE)

---

# 🔐 1. Authentication System

### Features

* Creator login (email + password)
* Brand login (Google OAuth)
* Brand login (Meta OAuth)
* Session persistence
* Logout

### Requirements

* Supabase Auth
* OAuth configured
* Redirect handling
* Profile creation on first login

---

# 👤 2. User Profile System

### Features

* Create profile on first login
* Store:

  * name
  * avatar
  * type (creator / brand)
* Fetch profile on session load

### Purpose

* Separate app user from auth user
* Support roles

---

# 🔗 3. Creator Public Link

Each creator has a link:

```
/c/[creator-id]
```

### Features

* Public page for creator
* Inquiry button
* Redirect to inquiry form

Purpose:

* Brands can start inquiry without signup

---

# 📩 4. Brand Inquiry Flow

### Features

* OAuth required before sending inquiry
* Inquiry form
* Submit message
* Save inquiry to DB

Fields:

* message
* campaign title (optional)
* budget (optional)

Flow:

```
link → login → form → save inquiry
```

---

# 📥 5. Inquiry Management (Creator side)

Creator dashboard shows:

* New inquiries
* Accepted inquiries
* Rejected inquiries

Features:

* View inquiry
* Accept
* Reject

---

# 🔄 6. Convert Inquiry → Deal

When creator accepts:

System must:

* Create deal row
* Link to inquiry
* Set stage = first stage
* Update inquiry status

This is core logic.

---

# 📊 7. Deal Pipeline (Kanban)

Creator dashboard shows:

Columns:

* Inquiry
* Negotiation
* Contract
* Production
* Completed

Features:

* Fetch deals
* Group by stage
* Move deal between stages
* Persist stage change

---

# 🧱 8. Deal Management

Each deal has:

* brand
* title
* stage
* budget
* created date

Features:

* View deal card
* Update stage
* Update fields (basic)

No editing UI needed yet.

---

# 🗄️ 9. Database Schema (MVP)

Tables needed:

* profiles
* inquiries
* deals
* deal_stages

Optional later:

* organizations
* comments
* files
* payments

Not in MVP.

---

# 🔐 10. Security (RLS)

Must implement:

* User sees only their data
* Creator sees only their deals
* Brand sees only their inquiries

Policies required for:

* profiles
* inquiries
* deals

---

# 🧭 11. Routing Structure

Routes needed:

```
/login
/signup
/dashboard
/c/[creator-id]
/c/[creator-id]/inquiry
```

Optional:

```
/deal/[id]
```

---

# ⚙️ 12. Session Handling

Features:

* Protect dashboard route
* Redirect if not logged in
* Load user on refresh

Must work with:

Supabase + Next.js App Router

---

# 🎨 13. UI Requirements (MVP)

Use current UI.

Needed screens:

* Login
* Signup
* Dashboard
* Inquiry form
* Kanban board

No redesign needed.

---

# 🧪 14. Basic Error Handling

Must handle:

* OAuth failure
* DB insert failure
* Session expired
* Unauthorized access

No fancy UI needed.

---

# 🚀 15. Deployment Ready

Must support:

* Env variables
* OAuth redirect URLs
* Production domain

---

# ❌ NOT IN MVP

Do NOT build yet:

* Teams
* Organizations
* Payments
* Notifications
* Emails
* File uploads
* Comments
* Roles system
* Analytics

These come later.

---

# 🧾 FINAL MVP FEATURE LIST

✅ Auth (email + Google + Meta)
✅ Profile creation
✅ Creator public link
✅ Inquiry submission
✅ Inquiry list
✅ Accept inquiry
✅ Create deal
✅ Kanban pipeline
✅ Stage update
✅ Supabase DB
✅ RLS security
✅ Protected routes
✅ Deployment ready

This is the MVP.

---
