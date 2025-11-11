# Quick Reference Card

## 🚀 Essential Commands

```bash
# Menu Management
npm run export-menu    # Create Excel file for editing
npm run import-menu    # Update menu from Excel
npm run view-menu      # View menu in terminal

# CSS (if modified)
npm run build:css      # Compile Tailwind CSS
```

## 🌐 Pages

| Page | Purpose | URL |
|------|---------|-----|
| Guest Ordering | Place orders | `orderingsystem.html` |
| Login/Signup | User authentication | `login.html` |
| Order History | View past orders & reorder | `order-history.html` |
| Staff Dashboard | Manage orders | `dashboard.html` |

## 📊 Firebase

- **Console**: https://console.firebase.google.com/
- **Project**: st-peters-bay-food-ordering
- **Collections**: `orders`, `users`

## 📝 Menu Editing Workflow

1. `npm run export-menu`
2. Open `data/menu_editor.xlsx`
3. Edit prices, items, availability
4. Save Excel file
5. `npm run import-menu`
6. Done! (Backup created automatically)

## 🔑 Order Statuses

- **New** 🔵 → **Preparing** 🟡 → **Ready** 🟢 → **Delivered** ⚪
- **Cancelled** 🔴 (if needed)

## 📂 Important Files

- `data/sample_menu.json` - Active menu (80 items)
- `data/menu_editor.xlsx` - Excel for editing
- `scripts/firebase-config.js` - Firebase settings
- `PROJECT_PROGRESS.md` - Complete documentation

## 🎯 Quick Stats

- **Total Menu Items**: 80
  - Beach Drinks: 55 items
  - Room Service: 25 items
- **Pages**: 4 (ordering, login, history, dashboard)
- **Database**: Firebase Firestore
- **Auth**: Email/Password

## 📞 Support

- Documentation: See `PROJECT_PROGRESS.md`
- Menu Guide: See `MENU_EDITING_GUIDE.md`
- Auth Guide: See `AUTH_SYSTEM_GUIDE.md`

---

**Status**: ✅ Complete & Production Ready
**Version**: 4.0
**Last Updated**: January 2025
