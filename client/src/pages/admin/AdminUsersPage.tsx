import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import type { User } from '@/types'

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })

  useEffect(() => {
    axiosInstance.get('/admin/users', { params: { role: 'customer', page } })
      .then(({ data }) => {
        setUsers(data.data ?? [])
        setMeta({
          current_page: data.current_page ?? 1,
          last_page: data.last_page ?? 1,
          total: data.total ?? 0,
        })
      })
  }, [page])

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3">Phone</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone}</td>
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
          >Previous</button>
          <button
            type="button"
            disabled={page >= meta.last_page}
            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.min(meta.last_page, value + 1))}
          >Next</button>
        </div>
      </div>
    </div>
  )
}
