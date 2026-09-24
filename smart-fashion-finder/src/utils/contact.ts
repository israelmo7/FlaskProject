import { Linking, Platform } from 'react-native';
import type { Store } from '@/types';

export function openNavigation(lat: number, lng: number, label: string) {
  const encoded = encodeURIComponent(label);
  const google = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  const apple = `http://maps.apple.com/?daddr=${lat},${lng}&q=${encoded}`;
  const waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const url = Platform.OS === 'ios' ? apple : google;
  Linking.openURL(url).catch(() => Linking.openURL(waze));
}

export function callStore(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  Linking.openURL(`tel:${cleaned}`);
}

export function openWhatsApp(whatsapp: string, message: string) {
  const phone = whatsapp.replace(/[^\d]/g, '');
  const text = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${text}`;
  Linking.openURL(url);
}

export function holdItemMessage(opts: {
  storeName: string;
  itemName: string;
  size: string;
}): string {
  return (
    `שלום ${opts.storeName},\n` +
    `מצאתי אצלכם באפליקציית StyleNear את הפריט "${opts.itemName}" במידה ${opts.size}.\n` +
    `אפשר לשמור לי אותו? תודה!`
  );
}

export function storeHasWhatsApp(store: Store): boolean {
  return Boolean(store.whatsapp);
}

export function storeHasPhone(store: Store): boolean {
  return Boolean(store.phone);
}
