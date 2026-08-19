import dayjs from 'dayjs';

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  return dayjs(dateString).format('DD MMM YYYY, hh:mm A');
}

export function formatDateShort(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  return dayjs(dateString).format('DD/MM/YYYY');
}

export function formatNumber(num: number | undefined | null, decimals: number = 2): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
  });
}
