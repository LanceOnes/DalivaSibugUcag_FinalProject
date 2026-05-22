import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import type { User } from '@/types'

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    axiosInstance.get('/admin/users', { params: { role: 'customer' } })
      .then(({ data }) => setUsers(data.data ?? []))
  }, [])

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
    </div>
  )
}
