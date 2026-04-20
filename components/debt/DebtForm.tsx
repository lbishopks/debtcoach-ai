'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Debt } from '@/types'

const DEBT_TYPE_OPTIONS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'medical', label: 'Medical' },
  { value: 'student', label: 'Student Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'auto', label: 'Auto Loan' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'settled', label: 'Settled' },
  { value: 'paid', label: 'Paid' },
  { value: 'closed', label: 'Closed' },
]

interface Props {
  userId: string
  debt?: Debt
  onSuccess: (debt: Debt) => void
  onCancel: () => void
}

export function DebtForm({ userId, debt, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    creditor_name: debt?.creditor_name || '',
    debt_type: debt?.debt_type || 'credit_card',
    original_amount: debt?.original_amount?.toString() || '',
    current_balance: debt?.current_balance?.toString() || '',
    days_past_due: debt?.days_past_due?.toString() || '',
    status: debt?.status || 'active',
    notes: debt?.notes || '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.creditor_name.trim()) {
      toast.error('Creditor name is required')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const payload = {
        user_id: userId,
        creditor_name: form.creditor_name.trim(),
        debt_type: form.debt_type,
        original_amount: Number(form.original_amount) || 0,
        current_balance: Number(form.current_balance) || 0,
        days_past_due: Number(form.days_past_due) || 0,
        status: form.status,
        notes: form.notes.trim() || null,
      }

      if (debt?.id) {
        const { data, error } = await supabase.from('debts').update(payload).eq('id', debt.id).select().single()
        if (error) throw error
        toast.success('Debt updated')
        onSuccess(data)
      } else {
        const { data, error } = await supabase.from('debts').insert(payload).select().single()
        if (error) throw error
        toast.success('Debt added!')
        onSuccess(data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save debt')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!debt?.id) return
    if (!confirm('Delete this debt permanently?')) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('debts').delete().eq('id', debt.id)
      if (error) throw error
      toast.success('Debt deleted')
      onCancel()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Creditor / Collection Agency Name *"
        placeholder="e.g. Capital One, Midland Credit Management"
        value={form.creditor_name}
        onChange={(e) => set('creditor_name', e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Debt Type"
          value={form.debt_type}
          onChange={(e) => set('debt_type', e.target.value)}
          options={DEBT_TYPE_OPTIONS}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
          options={STATUS_OPTIONS}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Original Amount ($)"
          type="number"
          min="0"
          step="0.01"
          placeholder="5000"
          value={form.original_amount}
          onChange={(e) => set('original_amount', e.target.value)}
        />
        <Input
          label="Current Balance ($)"
          type="number"
          min="0"
          step="0.01"
          placeholder="5000"
          value={form.current_balance}
          onChange={(e) => set('current_balance', e.target.value)}
        />
      </div>
      <Input
        label="Days Past Due"
        type="number"
        min="0"
        placeholder="180"
        value={form.days_past_due}
        onChange={(e) => set('days_past_due', e.target.value)}
      />
      <Textarea
        label="Notes (optional)"
        placeholder="Any notes about this debt, negotiation progress, contact names, etc."
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        rows={3}
      />

      <div className="flex gap-3 pt-2">
        {debt?.id && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        )}
        <div className="flex-1" />
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {debt?.id ? 'Update Debt' : 'Add Debt'}
        </Button>
      </div>
    </form>
  )
}
