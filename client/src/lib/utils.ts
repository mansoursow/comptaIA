import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric value as currency
 * @param amount The amount to format
 * @param locale The locale to use for formatting
 * @param currency The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string = "fr-FR",
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to a string
 * @param date The date to format
 * @param locale The locale to use for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  locale: string = "fr-FR"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Format a date with time to a string
 * @param date The date to format
 * @param locale The locale to use for formatting
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string,
  locale: string = "fr-FR"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

/**
 * Truncate a string to a maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Generate initials from a name (up to 2 characters)
 * @param name The name to generate initials from
 * @returns Initials
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get a status label for display
 * @param status The status code
 * @returns The status label in French
 */
export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    // Invoice statuses
    'draft': 'Brouillon',
    'sent': 'Envoyée',
    'paid': 'Payée',
    'overdue': 'En retard',
    
    // Document statuses
    'pending': 'En attente',
    'processed': 'Traité',
    'rejected': 'Rejeté',
    
    // Transaction types
    'income': 'Encaissement',
    'expense': 'Décaissement',
  };
  
  return statusMap[status] || status;
}

/**
 * Generates a random color based on a string input
 * @param str The input string
 * @returns CSS color string
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 40%)`;
}
