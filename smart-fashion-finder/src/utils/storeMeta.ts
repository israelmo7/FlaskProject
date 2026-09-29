import type { InventoryItem, SizeStock, Store, StoreHours } from '@/types';

/** מידות עם מלאי > 0 */
export function availableSizes(item: InventoryItem): string[] {
  return (item.sizeStock || []).filter((s) => s.qty > 0).map((s) => s.size);
}

export function allSizes(item: InventoryItem): SizeStock[] {
  return item.sizeStock || [];
}

export function qtyForSize(item: InventoryItem, size: string): number {
  const row = (item.sizeStock || []).find((s) => s.size === size);
  return row?.qty ?? 0;
}

export function hasSizeInStock(item: InventoryItem, preferredSize: string): boolean {
  if (!preferredSize || preferredSize === 'All') return true;
  return qtyForSize(item, preferredSize) > 0;
}

function parseHm(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** האם החנות פתוחה עכשיו (שעון מקומי של המכשיר) */
export function isStoreOpenNow(store: Store, now = new Date()): boolean {
  const hours = store.hours;
  if (!hours || hours.length === 0) return true;
  const day = now.getDay(); // JS: 0=Sun
  const today = hours.find((h) => h.day === day);
  if (!today) return false;
  if (today.open === today.close) return false; // סגור
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= parseHm(today.open) && mins < parseHm(today.close);
}

export function todayHoursLabel(store: Store, now = new Date()): string {
  const hours = store.hours;
  if (!hours || hours.length === 0) return '';
  const day = now.getDay();
  const today = hours.find((h) => h.day === day);
  if (!today || today.open === today.close) return 'סגור היום';
  return `${today.open}–${today.close}`;
}

export function hoursForDisplay(hours: StoreHours[] | undefined): StoreHours[] {
  return hours || [];
}
