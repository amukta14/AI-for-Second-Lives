"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const USER_ID = 'demo-user'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState<any[]>([])
  const [reminderLoading, setReminderLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [product, setProduct] = useState('')
  const [days, setDays] = useState(7)
  const productRef = useRef<HTMLInputElement>(null)
  const [zip, setZip] = useState('')
  const [store, setStore] = useState<any>(null)
  const [storeLoading, setStoreLoading] = useState(false)
  const [storeError, setStoreError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/users/${USER_ID}/eco-stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
    fetch(`${API_URL}/users/${USER_ID}/reminders`)
      .then(res => res.json())
      .then(data => {
        setReminders(data)
        setReminderLoading(false)
      })
  }, [])

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    const res = await fetch(`${API_URL}/users/${USER_ID}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, days })
    })
    const newReminder = await res.json()
    setReminders(r => [...r, newReminder])
    setProduct('')
    setDays(7)
    setAdding(false)
    productRef.current?.focus()
  }

  const deleteReminder = async (id: string) => {
    await fetch(`${API_URL}/users/${USER_ID}/reminders/${id}`, { method: 'DELETE' })
    setReminders(r => r.filter(rem => rem.id !== id))
  }

  const fetchStore = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!zip) return
    setStoreLoading(true)
    setStoreError('')
    setStore(null)
    try {
      const res = await fetch(`${API_URL}/stores?zip=${zip}`)
      if (!res.ok) throw new Error('No Walmart found for this ZIP')
      const data = await res.json()
      setStore(data)
    } catch (err: any) {
      setStoreError(err.message || 'Error fetching store info')
    } finally {
      setStoreLoading(false)
    }
  }, [zip])

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]">Loading...</div>

  const actionsToNextCoupon = 5 - (stats.actions % 5)
  const progress = ((stats.actions % 5) / 5) * 100

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Eco Reward Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="backdrop-blur bg-white/60 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Green Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{stats.greenScore}</div>
            <div className="text-sm text-gray-500 mt-2">Earned by reusing and recycling</div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur bg-white/60 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Total Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.reused}</div>
                <div className="text-xs text-gray-500">Reused</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{stats.recycled}</div>
                <div className="text-xs text-gray-500">Recycled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 backdrop-blur bg-white/60 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Progress to Next Coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-sm text-gray-700">You've saved {stats.actions % 5}/5 items – Next: Earn a 5% discount!</div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="bg-primary h-4 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            {actionsToNextCoupon === 0 && (
              <div className="mt-2 text-green-700 font-semibold">🎉 Coupon unlocked! Check your rewards.</div>
            )}
          </CardContent>
        </Card>
        <Card className="backdrop-blur bg-white/60 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Coupons Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.coupons}</div>
            <div className="text-xs text-gray-500 mt-2">5% off every 5 actions</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 backdrop-blur bg-white/60 shadow-lg border-0">
          <CardHeader>
            <CardTitle>Refill Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addReminder} className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                ref={productRef}
                type="text"
                className="border rounded px-3 py-2 flex-1"
                placeholder="Product name (e.g. Detergent)"
                value={product}
                onChange={e => setProduct(e.target.value)}
                required
              />
              <select className="border rounded px-3 py-2" value={days} onChange={e => setDays(Number(e.target.value))}>
                <option value={7}>7 days</option>
                <option value={15}>15 days</option>
                <option value={30}>30 days</option>
              </select>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={adding}>
                {adding ? 'Adding...' : 'Add Reminder'}
              </button>
            </form>
            {reminderLoading ? (
              <div>Loading reminders...</div>
            ) : reminders.length === 0 ? (
              <div className="text-gray-500">No reminders set.</div>
            ) : (
              <ul className="space-y-2">
                {reminders.map(rem => (
                  <li key={rem.id} className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
                    <div>
                      <span className="font-medium">{rem.product}</span> — refill in <span className="text-blue-600 font-semibold">{rem.days} days</span>
                      <span className="ml-2 text-xs text-gray-500">(on {new Date(rem.remindAt).toLocaleDateString()})</span>
                    </div>
                    <button onClick={() => deleteReminder(rem.id)} className="text-red-500 hover:underline text-sm">Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2 backdrop-blur bg-white/60 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-[#0071CE]">Walmart Store Info</span>
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#FFC220' }}></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={fetchStore} className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                type="text"
                className="border rounded px-3 py-2 flex-1"
                placeholder="Enter ZIP code (e.g. 10001)"
                value={zip}
                onChange={e => setZip(e.target.value)}
                required
                pattern="\\d{5}"
              />
              <button type="submit" className="bg-[#0071CE] text-white px-4 py-2 rounded">Find Store</button>
            </form>
            {storeLoading ? (
              <div>Loading store info...</div>
            ) : storeError ? (
              <div className="text-red-500">{storeError}</div>
            ) : store ? (
              <div className="space-y-2">
                <div className="font-bold text-lg text-[#0071CE]">{store.name}</div>
                <div className="text-gray-700">{store.address}</div>
                <div className="mt-2">
                  <span className="font-semibold text-[#FFC220]">Recycling Policy:</span>
                  <span className="ml-2">{store.recyclingPolicy}</span>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-[#FFC220]">Events:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {store.events.map((event: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        <span className="font-medium text-[#0071CE]">{event.name}</span> — <span className="text-gray-700">{event.date}</span>
                        <div className="text-xs text-gray-500">{event.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Enter your ZIP code to find local Walmart recycling info and events.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 