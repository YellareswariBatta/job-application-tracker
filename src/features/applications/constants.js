export const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected']

// Where the user found the role; used to show which channels get replies.
export const SOURCES = ['LinkedIn', 'Indeed', 'Company website', 'Referral', 'Recruiter or agency', 'Job board', 'Other']

// An Applied or Interviewing application with no movement for this many days is flagged as "quiet".
export const STALE_AFTER_DAYS = 14

export const STORAGE_KEY = 'jat.applications'
export const EXPORT_VERSION = 1

// Tailwind classes per status (kept whole so the compiler can see them).
export const STATUS_STYLES = {
  Applied: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    bar: 'border-t-blue-500',
    chart: '#3b82f6',
  },
  Interviewing: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    bar: 'border-t-amber-500',
    chart: '#f59e0b',
  },
  Offer: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    bar: 'border-t-green-500',
    chart: '#22c55e',
  },
  Rejected: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    bar: 'border-t-red-500',
    chart: '#ef4444',
  },
}
