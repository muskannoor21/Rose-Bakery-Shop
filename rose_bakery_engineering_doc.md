# Comprehensive Engineering Architecture & Specification Document
**Client:** Rose Bakery  
**Domain:** E-Commerce / Artisanal Bakery & Pastry Storefront  
**Document Version:** 1.0.0 (Production Blueprint)  

---

## Table of Contents
1. [Product Requirements Document (`PRD.md`)](#1-product-requirements-document-prdmd)
2. [System Architecture (`Architecture.md`)](#2-system-architecture-architecturemd)
3. [Database & Schema Specification (`Database.md`)](#3-database--schema-specification-databasemd)
4. [Design Tokens & Brand System (`Design.md`)](#4-design-tokens--brand-system-designmd)
5. [Security & Quality Engineering (`Security.md`)](#5-security--quality-engineering-securitymd)

---

## 1. Product Requirements Document (`PRD.md`)

### 1.1 Vision & Goals
Rose Bakery is transitioning from a traditional brick-and-mortar bakery into an enterprise-grade digital brand. The web platform serves two primary business functions:
1. **Daily Retail E-Commerce:** Driving frictionless same-day pastry orders and local delivery/pickup.
2. **Interactive Custom Cake Atelier:** Streamlining high-ticket custom tier cake commissions with instant price estimates and structured lead capture.

### 1.2 Target Personas
* **The Event Planner (Clara, 34):** Commissions high-end custom cakes for milestone events. Requires explicit lead times, tier specifications, flavor profiles, visual moodboard uploads, and transparent pricing estimates.
* **The Daily Treat Buyer (Marcus, 28):** Purchases fresh bread and pastries on his morning commute. Demands sub-minute mobile checkout via native digital wallets (Apple Pay / Google Pay).

### 1.3 Key Metrics & Performance Benchmarks
* **Lighthouse Performance Score:** $\ge 95$ across Performance, Accessibility, Best Practices, and SEO.
* **Target Conversion Rate:** $\ge 4.5\%$ on retail menu catalog.
* **Operational Efficiency:** 60% reduction in lead response turnaround for custom cake inquiries.

---

## 2. System Architecture (`Architecture.md`)

```
+---------------------------------------------------------------------------------+
|                                CLIENT LAYER                                     |
|  Next.js 14 App Router (React Server Components, Client Components, Tailwind)  |
+---------------------------------------+-----------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                                 APPLICATION LAYER                               |
|  Next.js Server Actions & API Routes (/api/*)                                   |
|  - Zod Input Validation & Rate Limiting                                         |
|  - Route Handlers (Stripe Payments, Custom Quotes, Inventory Slots)             |
+-------------------+-------------------+--------------------+--------------------+
                    |                   |                    |
                    v                   v                    v
+-------------------+---+   +-----------+-------+   +--------+--------------------+
|    SANITY CMS         |   |    SUPABASE DB    |   |     STRIPE PAYMENTS        |
| - Product Catalog     |   | - Order Records   |   | - PaymentIntents           |
| - Bakery Story        |   | - Custom Quotes   |   | - Apple Pay / Google Pay   |
| - Seasonal Items      |   | - Time Slots      |   | - Webhooks                 |
+-----------------------+   +-------------------+   +----------------------------+
```

### Tech Stack Decisions & Justification
* **Next.js 14 (App Router):** Leverages Hybrid SSR/ISR to render pre-baked static menu pages for instant SEO page loads while maintaining dynamic server action checkout flows.
* **Sanity CMS:** Empowers bakery staff to update daily menu inventory, out-of-stock items, and seasonal pricing without requiring code deployments.
* **Supabase (PostgreSQL):** Manages relational data integrity for delivery capacity caps, order statuses, and custom quote submissions.
* **Stripe Payments:** Handles secure web checkout with native Apple Pay and Google Pay integration, maintaining PCI-DSS compliance.

---

## 3. Database & Schema Specification (`Database.md`)

```sql
-- PostgreSQL Production Schema for Rose Bakery

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums
CREATE TYPE order_status AS ENUM (
  'pending', 
  'confirmed', 
  'in_preparation', 
  'ready_for_pickup', 
  'completed', 
  'cancelled'
);

CREATE TYPE order_type AS ENUM ('pickup', 'delivery');

CREATE TYPE quote_status AS ENUM (
  'submitted', 
  'under_review', 
  'approved', 
  'declined'
);

-- 1. Delivery & Pickup Time Slot Management
CREATE TABLE order_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_type order_type NOT NULL,
    max_capacity INT NOT NULL DEFAULT 10,
    current_orders INT NOT NULL DEFAULT 0,
    CONSTRAINT capacity_check CHECK (current_orders <= max_capacity)
);

-- 2. Customer Custom Cake Quote Requests
CREATE TABLE custom_cake_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT UNIQUE NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    event_date DATE NOT NULL,
    tier_option TEXT NOT NULL,
    sponge_flavor TEXT NOT NULL,
    filling_option TEXT NOT NULL,
    dietary_specifications TEXT[],
    design_description TEXT NOT NULL,
    reference_image_url TEXT,
    estimated_price NUMERIC(10, 2) NOT NULL,
    status quote_status DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Design Tokens & Brand System (`Design.md`)

### Color Palette
| Design Token | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| `rose-50` | `#FDF2F4` | Soft background fills, highlight badges |
| `rose-500` | `#E11D48` | Primary accent color, hover states, dynamic focus rings |
| `rose-900` | `#4C0519` | Main brand headers, primary call-to-action buttons |
| `cream-50` | `#FDFBF7` | Overall page background (warm French pâtisserie aesthetic) |
| `cream-100` | `#F7F3E9` | Card containers, sidebar backgrounds, step navigation |
| `flour-200` | `#E6DFD3` | Divider lines, soft input borders |
| `espresso-900` | `#1C1917` | High contrast primary typography |

### Typography System
* **Display / Headline Font:** Playfair Display, Serif (Artisanal, luxury feel)
* **Body / UI Font:** Plus Jakarta Sans, Sans-Serif (High legibility on mobile screens)

---

## 5. Security & Quality Engineering (`Security.md`)

* **Input Sanitization & Schema Validation:** Client and server routes validate payload structures using shared `Zod` schemas to protect against XSS and SQL injection.
* **Rate-Throttling:** Public quote submission routes (`/api/custom-quote`) utilize Upstash Redis rate-limiting to prevent automated spam abuse.
* **Environment Secret Isolation:** Server credentials (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are enforced using `t3-env` to ensure zero bundle exposure to clients.
* **Accessibility Standards:** 100% WCAG AA compliance with explicit ARIA attributes, semantic HTML primitives, and keyboard focus trap handling.
