# Authentication System Guide

This guide explains the new authentication system with order history and reorder functionality.

## What's New

### User Authentication
- Email/password authentication via Firebase
- Secure sign-up and login
- No credit card required (using Firebase free tier)
- Simple and secure password handling

### Order History
- View all past orders
- See order details, items, and totals
- Track order status
- Organized by date (newest first)

### Reorder Functionality
- One-click reorder from order history
- Items automatically added to cart
- Quick checkout process

## User Flow

### For New Users

1. **Visit the ordering page**: `orderingsystem.html`
2. **Click "Login / Sign Up"** in the header
3. **Create account**:
   - Switch to "Sign Up" tab
   - Enter name, email, and password (min 6 characters)
   - Click "Create Account"
4. **Start ordering**: Redirected to ordering page, now logged in

### For Returning Users

1. **Visit login page**: `login.html`
2. **Sign in** with email and password
3. **View order history**: Automatically redirected to order history page
4. **Reorder or place new order**

### Ordering While Logged In

- **Guest mode still works**: Users can skip login and order as guest
- **Logged-in benefits**:
  - Orders linked to account
  - Access to order history
  - Quick reorder functionality
  - "My Orders" button in header

## File Structure

### New Files

```
/login.html                    - Login/signup page
/order-history.html           - Order history with reorder
/scripts/auth.js              - Authentication logic
/AUTH_SYSTEM_GUIDE.md         - This guide
```

### Modified Files

```
/scripts/firebase-config.js   - Added Firebase Auth
/scripts/ordering_logic.js    - Links orders to users, reorder support
/orderingsystem.html          - Auth button in header
```

## Technical Details

### Firebase Authentication

The system uses Firebase Authentication's built-in email/password provider:

```javascript
// Sign up
createUserWithEmailAndPassword(auth, email, password)

// Sign in
signInWithEmailAndPassword(auth, email, password)

// Sign out
signOut(auth)
```

### Order Data Structure

Orders now include user information when someone is logged in:

```javascript
{
  menuType: 'beachDrinks' | 'roomService',
  name: 'Guest Name',
  location: 'Beach location or room number',
  items: [...],
  orderNotes: 'Special requests',
  status: 'new',
  timestamp: Firestore timestamp,
  userId: 'firebase-user-id',      // New: User ID if logged in
  userEmail: 'user@example.com'    // New: User email if logged in
}
```

### Reorder Implementation

When a user clicks "Reorder":

1. Order data stored in `sessionStorage`
2. User redirected to ordering page
3. Ordering page checks for reorder data
4. Cart populated with previous items
5. User can review and modify before submitting

### User State Management

The auth system automatically:
- Tracks authentication state
- Updates UI when user logs in/out
- Shows/hides appropriate buttons
- Redirects to login if accessing protected pages

## Security Considerations

### What's Secure
- ✓ Passwords hashed by Firebase (never stored in plain text)
- ✓ Secure HTTPS connections
- ✓ Firebase handles password requirements
- ✓ User sessions managed securely

### What's Not Critical
- No payment information stored
- No credit cards involved
- Simple room/beach orders only
- Low-security risk scenario

### Future Enhancements
If needed later, you could add:
- Password reset via email
- Email verification
- Social login (Google, Facebook)
- Two-factor authentication

## Firebase Console Setup

To view/manage users and orders:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: "st-peters-bay-food-ordering"
3. **Authentication** tab: View registered users
4. **Firestore** tab: View orders collection

### Authentication Tab
- See all registered users
- Disable/delete users if needed
- View sign-in methods

### Firestore Tab
- `users` collection: User profiles
- `orders` collection: All orders (with userId)
- Can query orders by userId to see user's history

## Common Issues & Solutions

### "User not logged in" on order history
**Solution**: User needs to log in first at `login.html`

### "Email already in use"
**Solution**: User should use "Sign In" tab instead of "Sign Up"

### Orders not showing in history
**Solution**:
- Check if user was logged in when placing order
- Old orders from before auth won't show (no userId)
- Only shows orders placed while logged in

### Can't access Firebase Console
**Solution**: Need Firebase project access from project owner

## Testing the System

### Test Sign Up
1. Go to `login.html`
2. Click "Sign Up" tab
3. Enter test email (e.g., `test@test.com`)
4. Enter name and password
5. Should redirect to ordering page

### Test Ordering (Logged In)
1. Place an order while logged in
2. Check that order shows your email in dashboard
3. Visit `order-history.html`
4. Should see the order

### Test Reorder
1. Go to order history
2. Click "🔄 Reorder This" on any order
3. Should redirect to ordering page
4. Items should be in cart
5. Green notification should appear

### Test Guest Mode
1. Log out
2. Place order without logging in
3. Should work normally
4. Order won't appear in history (no userId)

## Benefits Summary

### For Guests
- ✅ Can still order without account
- ✅ Quick checkout
- ✅ No registration required

### For Registered Users
- ✅ View complete order history
- ✅ One-click reorder
- ✅ Track order status
- ✅ Faster repeat orders

### For Business
- ✅ Track customer behavior
- ✅ Identify repeat customers
- ✅ Better customer service
- ✅ Email communication possible

## Future Enhancements

Possible additions:
- [ ] Email notifications for order updates
- [ ] Favorite items list
- [ ] Saved delivery locations
- [ ] Order templates
- [ ] Loyalty points system
- [ ] Push notifications
- [ ] Mobile app
