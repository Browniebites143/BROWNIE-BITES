# Brownie Bite — Swiggy-style Ordering (Firebase)

A minimal Swiggy-like ordering flow for **Brownie Bite** using Firebase Realtime Database.

## Pages
- `index.html` — Menu → Cart → Address → Payment (COD / UPI / GPay / PhonePe / Paytm / FamPay) → Thank You
- `thankyou.html` — Shows **Order ID** after placing order
- `login.html` — Admin login (username/pin stored client-side)
- `admin.html` — Admin dashboard (list + edit status & payment + delete order + manage menu)

## Admin Credentials
- **Username:** `BROWNIE BITES`
- **Pin:** `BROWNIEbites@463235_6432`

## Firebase
1. Create a Realtime Database, **location:** any, then set rules (dev mode):
```json
{
  "rules": {
    "orders": { ".read": true, ".write": true },
    "menu":   { ".read": true, ".write": true }
  }
}
```
> For production, restrict writes appropriately.

2. Put your project keys into `firebaseConfig.js` (already filled with your latest keys).

## UPI Notes
- UPI link uses: `upi://pay?pa=9380248566@fam&pn=Brownie%20Bite&am=<total>&cu=INR&tn=<orderId>`
- Android uses **intent** with a fallback to Thank You page.
- iOS shows chooser / confirmation depending on installed apps and Safari settings.
- Payment confirmation is **not** verified automatically (no PSP callback). Admin can update payment status to **Paid**.

## Local run
Just open `index.html` in a server (e.g. VS Code Live Server) to avoid file URL issues.
