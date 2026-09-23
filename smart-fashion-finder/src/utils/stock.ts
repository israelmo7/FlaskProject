import type { StockStatus } from '@/types';

export function stockLabel(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
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
