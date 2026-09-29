# StyleNear — Smart Fashion Finder

React Native (Expo) + TypeScript app that identifies garments from a photo or avatar, then shows which nearby physical stores have matching stock, distance, and price.

## מסמכי בסיס (עברית)

לפני עוד פיצ׳רים — אלה מגדירים את ה־MVP וה־UX:

1. **[הגדרת הצורך והפתרון (MVP)](docs/mvp.md)** — הבעיה, הקהל, מה בפנים / מה בחוץ
2. **[אפיון UX — User Flow + Wireframes](docs/ux-flow.md)** — מסלול המשתמש וסקיצות מסכים
3. **[פערים מול ה־MVP](docs/gaps-vs-mvp.md)** — מה כבר בקוד ומה לבנות אחר כך

## Stack

- Expo SDK 57 + Expo Router (Stack + Bottom Tabs)
- NativeWind (Tailwind CSS)
- `expo-image-picker` / `expo-camera` for capture
- `expo-location` + mock Haifa inventory for nearby stock
- Mock Vision recognition hook (swap for Google Cloud Vision / OpenAI Vision)

## Run

```bash
cd smart-fashion-finder
npm install
npx expo start
```

Then press `w` for web, or scan the QR with Expo Go.

## Screens

1. **Discover (בית)** — חיפוש, בובה, צילום/גלריה, מצא לידך
2. **Garment Analysis** — פירוט זיהוי + מצא לידך
3. **Nearby Stock** — חנויות עם מלאי, מידה, ניווט
4. **Avatar / פרופיל** — דמות, מידה, הלבשה
5. **אזור / עגלה** — בחירת אזור פיילוט ורשימת פריטים לחיפוש
