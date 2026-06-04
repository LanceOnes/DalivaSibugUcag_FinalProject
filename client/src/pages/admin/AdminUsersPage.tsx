import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { toast } from '@/lib/toast'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2 } from 'lucide-react'

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Partial<User> & { password?: string } | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    axiosInstance
      .get('/admin/users', { params: { role: 'customer', page, search: search || undefined } })
      .then(({ data }) => {
        setUsers(data.data ?? [])
        setMeta({
          current_page: data.current_page ?? 1,
          last_page: data.last_page ?? 1,
          total: data.total ?? 0,
        })
      })
      .catch(() => toast.error('Failed to load customers'))
  }

  useEffect(() => {
    load()
  }, [page, search])

  const save = async () => {
    if (!editing?.id) return
    setSaving(true)
    try {
      const payload: Record<string, string | null> = {
        name: editing.name ?? '',
        email: editing.email ?? '',
        phone: editing.phone ?? null,
        address: editing.address ?? null,
      }
      if (editing.password) {
        payload.password = editing.password
      }
      await axiosInstance.put(`/admin/users/${editing.id}`, payload)
      toast.success('Customer updated')
      setEditing(null)
      load()
    } catch {
      toast.error('Failed to update customer')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    try {
      await axiosInstance.delete(`/admin/users/${userToDelete.id}`)
      toast.success('Customer deleted')
      setUserToDelete(null)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error('Delete failed', msg || 'Could not delete customer.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="mt-4 max-w-sm">
        <Input
          placeholder="Search name, email, or phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone ?? '—'}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing({ ...u, password: '' })}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setUserToDelete(u)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>{meta.total} customers</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= meta.last_page}
            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.min(meta.last_page, value + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Edit customer</h2>
            <div className="mt-4 grid gap-3">
              <div>
                <Label>Name</Label>
                <Input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editing.email ?? ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editing.phone ?? ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={editing.address ?? ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
              </div>
              <div>
                <Label>New password (optional)</Label>
                <Input
                  type="password"
                  value={editing.password ?? ''}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Delete customer</h2>
            <p className="mt-2 text-sm text-gray-600">
              Remove <strong>{userToDelete.name}</strong>? Their account will be permanently deleted.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUserToDelete(null)}>
                Cancel
              </Button>
              <Button onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
