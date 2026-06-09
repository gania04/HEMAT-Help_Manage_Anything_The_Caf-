# ARCHITECTURE.md - HEMAT Technical Specification (v1.2)

## 1. System Architecture Overview

HEMAT uses a modern web architecture optimized for reliability, offline capability, and real-time data sync.

### Tech Stack
- **Frontend:** Next.js (React) with PWA support.
- **Backend-as-a-Service:** Supabase (Auth, PostgreSQL, Realtime, Storage).
- **Offline Storage:** IndexedDB (via Dexie.js or similar) for POS resilience.
- **External Integration:** GoldAPI.io for real-time gold price fetching.

---

## 2. Database Schema (PostgreSQL)

### Core Modules
#### Users & Auth
- `users`: (id, email, full_name, role [owner, manager, kasir, admin], business_id)

#### Inventory & HPP
- `inventory`: (id, item_name, category, quantity, unit, unit_price, min_stock)
- `unit_conversions`: (id, item_id, from_unit, to_unit, ratio)
- `menus`: (id, menu_name, base_hpp)
- `menu_prices`: (id, menu_id, channel [dine_in, takeaway, delivery_platforms], price)

#### Transactions (Header-Detail)
- `transactions`: (id, created_by, channel, payment_method, total_amount, status [completed, pending_void, voided], created_at)
- `transaction_items`: (id, transaction_id, menu_id, quantity, price_at_sale)

#### Security & Monitoring
- `audit_logs`: (id, user_id, action, old_value, new_value, timestamp)
- `waste_logs`: (id, item_id, quantity, reason, staff_id, date)

---

## 3. Data Flow

### 3.1 POS Offline-First Flow
1. **Transaction Entry:** Kasir inputs order -> UI updates via local state.
2. **Persistence:** Order saved to `IndexedDB`.
3. **Synchronization:** - If Online: Immediate push to Supabase via REST/Realtime.
   - If Offline: Service Worker listens for connectivity change -> Auto-sync when online.
4. **Stock Update:** Trigger function in Supabase updates `inventory.quantity` based on `transaction_items`.

### 3.2 Void Transaction Flow
1. **Request:** Kasir clicks "Void" -> Status sets to `pending_void`.
2. **Approval:** Manager receives notification -> Signs off -> Status sets to `voided`.
3. **Reversal:** Database Trigger restores stock levels.

---

## 4. API Specification (Summary)

### Internal (Supabase RPC/Rest)
- `POST /transactions`: Submit new transaction header and items.
- `GET /inventory/low-stock`: Fetch items below `min_stock` threshold.
- `PATCH /transactions/:id/void`: Update status to pending/voided.

### External Integrations
- **Gold Price API (GoldAPI.io):** - `GET /api/XAU/IDR`: Fetched daily at 00:00.
  - Used to update `global_settings.current_gold_price` for Zakat calculation.

---

## 5. Security & Performance
- **RBAC:** Row Level Security (RLS) enabled in Supabase to ensure users only access their `business_id` data.
- **PWA Caching:** Assets and static data cached via Workbox for < 3s load time.
- **Audit Logging:** Non-bypassable logging for any manual stock or price adjustments.
