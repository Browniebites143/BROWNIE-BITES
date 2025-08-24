# Brownie Bite — Mini Ordering Site

This folder is a complete working demo using **Firebase Realtime Database (v8 CDN)**.

## Features
- Swiggy-like menu grid (editable from Admin → Menu Editor)
- Order form with: Name, Phone, Email (optional), Address, Product, Quantity
- Auto total calculation
- **UPI flow** (Google Pay, PhonePe, Paytm, BHIM, FamPay, Other). Amount and **order ID auto-fill** via the `tn` parameter.
- COD option
- Order ID generator: `BB-YYYYMMDD-XXXXXX`
- Track order by ID (status + payment status)
- Thank-you page showing Order ID
- **Admin dashboard** (login → view/edit orders, statuses, payment status, delete orders; manage menu)
- Logout button

## Admin Login
- **Username:** `BROWNIE BITES`  
- **PIN:** `BROWNIEbites@463235_6432`

> You can change these in `login.html` (look for `ADMIN_USER` / `ADMIN_PIN`).

## Firebase Setup
1. Create a Firebase project → Realtime Database → copy your **Database URL**.
2. Open `firebaseConfig.js` and ensure the config matches your project (already filled with your values).
3. In Realtime Database **Rules**, for testing you can use:
```json
{
  "rules": {
    "orders": { ".read": true, ".write": true },
    "menu":   { ".read": true, ".write": true }
  }
}
```
Later, secure it (recommended):
```json
{
  "rules": {
    "orders": {
      ".read": true,
      "$id": {
        ".write": "auth != null || newData.child('paymentMethod').val() == 'COD'"
      }
    },
    "menu": { ".read": true, ".write": "auth != null" }
  }
}
```

## iOS / Android UPI Notes
- We create `upi://pay?...` links with `am` (amount) and `tn` (order ID as note). Mobile browsers show a chooser to open the app you select. Some iOS builds may still show “Open WhatsApp?” if your device routes deep links oddly. Tapping any UPI app should move you there.
- Web can’t detect payment completion reliably. Our flow asks the customer to tap **“I have paid”** after returning to the site; this marks `paymentStatus = "Paid"` and redirects to Thank You.

## Run Locally
- Just open `index.html` to test (no build step).
- For Admin, open `login.html` → enter admin credentials → manage orders in `admin.html`.

## File List
- `index.html` — customer page (menu, order, UPI, tracking)
- `thankyou.html` — post-order page
- `login.html` — admin login (simple client check)
- `admin.html` — dashboard table + menu editor
- `style.css` — site styles
- `firebaseConfig.js` — your Firebase keys
- `script.js` — index logic
- `admin.js` — admin logic
