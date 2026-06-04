import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { formatPeso } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FulfillmentRow {
  period: string
  pickup_count: number
  delivery_count: number
  total_count: number
}

interface Report {
  from: string
  to: string
  period: 'daily' | 'monthly'
  total_revenue: number
  total_orders: number
  avg_order_value: number
  daily_revenue: { date: string; revenue: string; orders: number }[]
  top_products: { item_name: string; size_label: string | null; qty: number; revenue: string }[]
  fulfillment_split: Record<string, number>
  fulfillment_tracking: FulfillmentRow[]
}

function formatPeriodLabel(period: string, view: 'daily' | 'monthly') {
  if (view === 'monthly') {
    const [year, month] = period.split('-')
    return new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric' }).format(
      new Date(Number(year), Number(month) - 1, 1),
    )
  }
  const date = new Date(period)
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function AdminReportsPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [from, setFrom] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    axiosInstance
      .get('/admin/reports', { params: { from, to, period } })
      .then(({ data }) => setReport(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [from, to, period])

  const handlePrint = () => window.print()

  if (loading && !report) return <p>Loading reports…</p>
  if (!report) return <p>Unable to load reports.</p>

  const pickupTotal = Number(report.fulfillment_split.pickup ?? 0)
  const deliveryTotal = Number(report.fulfillment_split.delivery ?? 0)

  return (
    <div className="reports-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button type="button" variant="outline" onClick={handlePrint}>
          Print report
        </Button>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4 print:hidden">
        <div>
          <Label>From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label>To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Label>Pickup / delivery view</Label>
          <select
            className="flex h-11 w-full rounded-xl border px-3"
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'daily' | 'monthly')}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="button" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-500 print:mt-0">
        {report.from} — {report.to}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-sm">Picked up by customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-belly-brown">{pickupTotal}</p>
            <p className="mt-1 text-xs text-gray-600">Orders collected in-store</p>
          </CardContent>
        </Card>
        <Card className="border-sky-200 bg-sky-50/50">
          <CardHeader>
            <CardTitle className="text-sm">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-belly-brown">{deliveryTotal}</p>
            <p className="mt-1 text-xs text-gray-600">Orders sent to customer address</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPeso(report.total_revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.total_orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPeso(report.avg_order_value)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fulfillment summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span>Picked up by customer</span>
              <span className="text-lg font-bold">{pickupTotal}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-sky-50 px-3 py-2">
              <span>Delivered</span>
              <span className="text-lg font-bold">{deliveryTotal}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue by day</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
              {report.daily_revenue.length === 0 && <li className="text-gray-500">No orders in range</li>}
              {report.daily_revenue.map((row) => (
                <li key={row.date} className="flex justify-between">
                  <span>{row.date}</span>
                  <span>
                    {row.orders} orders · {formatPeso(Number(row.revenue))}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {period === 'daily' ? 'Daily' : 'Monthly'} pickup &amp; delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">{period === 'daily' ? 'Date' : 'Month'}</th>
                <th className="p-3 text-right">Pickup</th>
                <th className="p-3 text-right">Delivery</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.fulfillment_tracking.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    No orders in this range
                  </td>
                </tr>
              )}
              {report.fulfillment_tracking.map((row) => (
                <tr key={row.period} className="border-t">
                  <td className="p-3">{formatPeriodLabel(row.period, period)}</td>
                  <td className="p-3 text-right">{row.pickup_count}</td>
                  <td className="p-3 text-right">{row.delivery_count}</td>
                  <td className="p-3 text-right font-medium">{row.total_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {report.top_products.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {p.item_name} {p.size_label}
                </span>
                <span>
                  {p.qty} sold · {formatPeso(Number(p.revenue))}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .reports-page, .reports-page * { visibility: visible; }
          .reports-page { position: absolute; left: 0; top: 0; width: 100%; padding: 1rem; }
        }
      `}</style>
    </div>
  )
}
