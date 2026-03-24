This is structured like a real startup build plan:
👉 Phases → Features → Tasks → Implementation details

---

# 📄 MVP PRD: “Creator–Brand Collaboration Platform”

---

# 🎯 0. MVP GOAL

Build a system where:

* Creators can manage brand collaborations via a Kanban dashboard
* Brands can send collaboration inquiries with **minimum friction (OAuth only)**
* System converts inquiries → deals → pipeline

---

# 🧱 1. CORE FEATURES (MVP SCOPE)

## 1. Authentication System

* Creator login/signup
* Brand OAuth login (Google, Meta)
* Session management

---

## 2. Brand Inquiry Flow

* Public inquiry page (shareable link)
* OAuth → submit inquiry
* Store inquiry in DB

---

## 3. Creator Dashboard

* View inquiries
* Accept / reject inquiries
* Kanban board for deals

---

## 4. Deal Management

* Create deal from inquiry
* Update deal stage
* Persist pipeline state

---

## 5. Database + Security

* Proper schema
* Row Level Security (RLS)

---

---

# 🗂️ 2. IMPLEMENTATION PLAN (STEP-BY-STEP)

---

# 🔐 PHASE 1: AUTHENTICATION SYSTEM

## 🎯 Goal:

Enable login for:

* Creators (email + password)
* Brands (Google / Meta OAuth)

---

## ✅ Tasks

### 1. Setup Auth in Supabase

* Enable Email/Password
* Enable OAuth providers:

  * Google
  * Facebook (Meta)

---

### 2. Configure OAuth Providers

#### Google:

* Create project in Google Cloud
* Enable OAuth consent screen
* Add redirect URL:

  ```
  https://<project>.supabase.co/auth/v1/callback
  ```

#### Meta (Facebook):

* Create app in Meta Developer Console
* Add Facebook Login
* Add same redirect URL

---

### 3. Frontend Auth Integration

#### Creator login:

* Email/password form
* Use:

  ```ts
  supabase.auth.signInWithPassword()
  ```

#### Brand login:

* Buttons:

  * Continue with Google
  * Continue with Facebook

```ts
supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

---

### 4. Session Handling

* Persist session in Next.js
* Protect dashboard routes

---

### 5. Profile Creation (IMPORTANT)

After login:

* Check if profile exists
* If not → create:

```ts
profiles:
- user_id
- type (creator / brand)
- name
```

---

# 🧾 PHASE 2: DATABASE SETUP

## 🎯 Goal:

Create structured backend for:

* users
* inquiries
* deals
* pipeline

---

## ✅ Tasks

### 1. Create Tables

* profiles
* inquiries
* deals
* deal_stages

---

### 2. Define Relationships

* inquiry → creator
* inquiry → brand
* deal → inquiry
* deal → stage

---

### 3. Seed default deal stages

* Inquiry
* Negotiation
* Contract
* Production
* Completed

---

### 4. Enable Row Level Security (RLS)

#### Policies:

* Users can only access:

  * their own inquiries
  * their own deals

---

# 📩 PHASE 3: BRAND INQUIRY FLOW

## 🎯 Goal:

Allow brands to send inquiry in < 10 seconds

---

## ✅ Tasks

### 1. Create Public Page

Route:

```
/c/[creator-id]/inquiry
```

---

### 2. Flow Logic

#### If not logged in:

* Show OAuth buttons

#### After login:

* Show inquiry form

---

### 3. Inquiry Form Fields

* message (required)
* campaign title (optional)
* budget (optional)

---

### 4. Submit Inquiry

Insert into DB:

```ts
inquiries:
- creator_user_id
- brand_user_id
- message
- status = 'new'
```

---

### 5. Success State

* Show confirmation screen
* Optional: email notification (later)

---

# 🧑‍💼 PHASE 4: CREATOR DASHBOARD

## 🎯 Goal:

Creators manage all incoming collaborations

---

## ✅ Tasks

### 1. Fetch Data

* Fetch inquiries
* Fetch deals

---

### 2. Inquiry List UI

* Show:

  * brand name
  * message
  * timestamp

---

### 3. Actions

* Accept
* Reject

---

### 4. Accept Flow

When creator clicks accept:

1. Create deal
2. Link to inquiry
3. Update inquiry status

---

# 🔄 PHASE 5: DEAL PIPELINE (KANBAN)

## 🎯 Goal:

Visual deal tracking

---

## ✅ Tasks

### 1. Replace mock data

* Fetch deals from DB

---

### 2. Map stages → columns

* Use `deal_stages` table

---

### 3. Render Kanban UI

* Column = stage
* Cards = deals

---

### 4. Update Deal Stage

On drag or action:

```ts
update deals
set stage_id = newStage
```

---

### 5. Persist changes in DB

---

# 🔐 PHASE 6: SECURITY (CRITICAL)

## 🎯 Goal:

Protect all data

---

## ✅ Tasks

### 1. Enable RLS on all tables

---

### 2. Write policies:

#### Inquiries:

* Creator sees only their inquiries
* Brand sees only their inquiries

#### Deals:

* Same logic

---

### 3. Validate ownership in queries

---

# ⚡ PHASE 7: POLISH (MVP READY)

## 🎯 Goal:

Make it usable

---

## ✅ Tasks

### 1. Loading states

* skeleton UI

---

### 2. Error handling

* auth errors
* DB errors

---

### 3. Empty states

* no inquiries
* no deals

---

### 4. Basic responsiveness

---

# 🧪 PHASE 8: TESTING

## 🎯 Goal:

Ensure flows work end-to-end

---

## ✅ Test Cases

### Brand:

* Can login via Google
* Can submit inquiry

### Creator:

* Can see inquiry
* Can accept → creates deal
* Can move deal in Kanban

---

# 🚀 PHASE 9: DEPLOYMENT

## ✅ Tasks

* Deploy frontend (Vercel / Firebase)
* Configure environment variables
* Add domain
* Test OAuth redirect URLs

---

# 🧠 FINAL MVP ARCHITECTURE

```
Frontend (Next.js)
   ↓
Supabase Auth (OAuth)
   ↓
Supabase DB (RLS secured)
```

---

# 💡 CRITICAL RULES (DO NOT BREAK)

1. ❌ No business logic in frontend
2. ✅ Use RLS for security
3. ❌ Do not over-engineer (no orgs yet)
4. ✅ Keep inquiry flow frictionless
5. ✅ Convert inquiry → deal cleanly

---

# 🎯 WHAT THIS PRD GIVES YOU

If you follow this exactly:

✅ You won’t miss any feature
✅ You won’t overbuild
✅ You’ll ship a real SaaS MVP
✅ You can scale later cleanly

---

