import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { formatPeso } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Report {
  total_revenue: number
  total_orders: number
  avg_order_value: number
  daily_revenue: { date: string; revenue: string; orders: number }[]
  top_products: { item_name: string; size_label: string | null; qty: number; revenue: string }[]
}

export function AdminReportsPage() {
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    axiosInstance.get('/admin/reports').then(({ data }) => setReport(data))
  }, [])

  if (!report) return <p>Loading reports…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatPeso(report.total_revenue)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Orders</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{report.total_orders}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Avg Order</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatPeso(report.avg_order_value)}</p></CardContent></Card>
      </div>
      <Card className="mt-8">
        <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {report.top_products.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.item_name} {p.size_label}</span>
                <span>{p.qty} sold · {formatPeso(Number(p.revenue))}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
