# StyleNear — Smart Fashion Finder

React Native (Expo) + TypeScript app that identifies garments from a photo or avatar, then shows which nearby physical stores have matching stock, distance, and price.

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

1. **Discover** — upload / camera / avatar entry, filters, recent + trending
2. **Garment Analysis** — bounding boxes + AI breakdown + **Find Near Me**
3. **Nearby Stock** — list/map of stores with stock status, price, navigate
4. **Avatar** — body type + garment overlay try-on
