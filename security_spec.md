# Firebase Security Specification

## Data Invariants
1. Products can only be created, updated, and deleted by an `admin` (a user with a document in `/admins/{uid}`).
2. Orders can be read and updated by an `admin`.
3. Orders can be created by any user (even unauthenticated). Wait! Unauthenticated user creating an order? The user orders via WhatsApp mostly, but if we need "orders" in Dashboard, either they create via website or admin creates them. The prompt says "I can see oders". If it's a website ordering system, users need to submit. I will just let anyone create an order, but ONLY admins can read/update orders.
4. Admins can read all products, orders, and admins.
5. All updates and creates must respect schema lengths and strict types.

## Dirty Dozen Payloads
- Missing field on product create
- Admin spoofing (setting id of someone else)
- Extra field (shadow field) on update
- Injecting `isVerified: true` equivalent
- Updating immutable fields like `createdAt`
- etc.

See tests for full coverage.
