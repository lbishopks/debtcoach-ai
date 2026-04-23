import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getDebtStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-blue-500/20 text-blue-300',
    in_dispute: 'bg-yellow-500/20 text-yellow-300',
    settled: 'bg-teal-500/20 text-teal-300',
    paid: 'bg-green-500/20 text-green-300',
    closed: 'bg-gray-500/20 text-gray-400',
  }
  return colors[status] || 'bg-slate-500/20 text-slate-300'
}

export function getDebtStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Active',
    in_dispute: 'In Dispute',
    settled: 'Settled',
    paid: 'Paid',
    closed: 'Closed',
  }
  return labels[status] || status
}

export function getDebtTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    credit_card: 'Credit Card',
    medical: 'Medical',
    student_loan: 'Student Loan',
    personal_loan: 'Personal Loan',
    auto: 'Auto Loan',
    collections: 'Collections',
    mortgage: 'Mortgage',
    other: 'Other',
  }
  return labels[type] || type
}

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
]
