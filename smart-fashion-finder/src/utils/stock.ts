import type { StockStatus } from '@/types';
import { he } from '@/i18n/he';

export function stockLabel(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return he.inStock;
    case 'low_stock':
      return he.lowStock;
    case 'out_of_stock':
      return he.outOfStock;
  }
}

export function stockColorClass(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'bg-stock-high';
    case 'low_stock':
      return 'bg-stock-low';
    case 'out_of_stock':
      return 'bg-stock-out';
  }
}

export function formatPriceILS(amount: number): string {
  return `₪${amount}`;
}
