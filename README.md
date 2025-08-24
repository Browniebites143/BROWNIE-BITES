# Brownie Bite — Mini Ordering Site

Simple two-page site for taking brownie orders and managing them with Firebase Realtime Database.

## Pages
- `index.html` — Customer page with menu, address/phone/email, quantity, auto total, **auto Order ID**, **order status tracker**, and **UPI / COD**. When UPI is selected, it shows a modal that lets the user open Google Pay / PhonePe / Paytm / BHIM / FamPay. The Order ID is passed as the payment **note** and amount auto-fills.
- `thankyou.html` — Shows the Order ID after placing the order.
- `login.html` — Admin login (username/pin stored locally).
- `admin.html` — Admin dashboard to view orders, edit **delivery status** and **payment status**, and **delete orders**.
- `style.css` — Styles.
- `firebaseConfig.js` — Your Firebase config (already filled with your project).
- `script.js` — Frontend logic for `index.html`.
- `admin.js` — Logic for admin dashboard.

## Admin Credentials
- **Username:** `BROWNIE BITES`
- **Pin:** `BROWNIEbites@463235_6432`

## Firebase
Realtime Database rules for quick testing (open):
```json
{
  "rules": {
    "orders": { ".read": true, ".write": true }
  }
}
```
Secure version (require a public key string as `authKey` inside each write — optional enhancement not enabled in this sample).

## Notes
- iOS cannot be forced to open a specific UPI app from the web; the modal includes a generic link + a copy-link fallback. Android usually opens the chosen app.
- Admin page requires the hardcoded login and stores a flag in `sessionStorage`.
- Orders are saved under `orders/{orderId}`.
- Payment status becomes **Paid** when the customer taps “I've Paid” on the modal (cannot auto-verify payment from the browser).