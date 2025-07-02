'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Filter, TrendingUp, Users, DollarSign, Package } from 'lucide-react'
import { getAggregatedData } from '@/lib/database'

interface SalesRecord {
  name: string
  sales_rands: number
  mass_kg: number
  sales_qty: number
  customer_count: number
  avg_price_per_kg: number
  record_count: number
}

interface OrderHistoryRecord {
  week: string
  Product1: number
  Product2: number
  Product3: number
}

export default function SalesTraderDashboard() {
  const [data, setData] = useState<SalesRecord[]>([])
  const [orderHistoryData, setOrderHistoryData] = useState<OrderHistoryRecord[]>([])
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    supplier: '',
    customer: '',
    product: '',
    trader: 'Bruce'
  })
  const [loading, setLoading] = useState(true)

  const suppliers = ['Riversmead Poultry', 'Sala Pork', 'Midlands Eggs', 'Corona Cheese', 'Halaal Fresh Meats Beef', 'Topgrade Beef', 'Crest Choice']
  const customers = ['Customer 1', 'Customer 2', 'Customer 3']
  const products = ['Product 1', 'Product 2', 'Product 3']
  const traders = ['Bruce', 'Preshantha']

  const loadData = async () => {
    setLoading(true)
    try {
      const aggregatedData = await getAggregatedData({ ...filters, groupBy: 'product' })
      setData(aggregatedData)
      
      const mockOrderHistory = [
        { week: '5 Weeks Prior', Product1: 5, Product2: 7, Product3: 5 },
        { week: '4 Weeks Prior', Product1: 6, Product2: 0, Product3: 5 },
        { week: '3 Weeks Prior', Product1: 4, Product2: 0, Product3: 5 },
        { week: '2 Weeks Prior', Product1: 3, Product2: 3, Product3: 0 },
        { week: '1 Week Prior', Product1: 2, Product2: 1, Product3: 0 }
      ]
      setOrderHistoryData(mockOrderHistory)
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [filters, loadData])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const totalSales = data.reduce((sum: number, item: SalesRecord) => sum + item.sales_rands, 0)
  const totalMass = data.reduce((sum: number, item: SalesRecord) => sum + item.mass_kg, 0)
  const totalCustomers = data.reduce((sum: number, item: SalesRecord) => sum + item.customer_count, 0)
  const avgPricePerKg = totalMass > 0 ? totalSales / totalMass : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sales Trader Dashboard (Office)
          </h1>
          <p className="text-lg text-gray-600">
            Office performance tracking for {filters.trader}
          </p>
        </div>

        {/* Trader Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Sales Trader</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {traders.map(trader => (
              <button
                key={trader}
                onClick={() => handleFilterChange('trader', trader)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  filters.trader === trader
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold">{trader}</h3>
                  <p className="text-sm text-gray-600">Sales Trader</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={filters.customer}
                onChange={(e) => handleFilterChange('customer', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={filters.product}
                onChange={(e) => handleFilterChange('product', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth % (Rands MTD)</p>
                <p className="text-2xl font-bold text-gray-900">+12.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth % (Kg MTD)</p>
                <p className="text-2xl font-bold text-gray-900">+8.3%</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Count</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">P/Kg Average</p>
                <p className="text-2xl font-bold text-gray-900">R{avgPricePerKg.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'sales_rands' ? `R${value.toLocaleString()}` : value,
                    name === 'sales_rands' ? 'Sales (Rands)' : 
                    name === 'customer_count' ? 'Customers' : 'P/Kg Average'
                  ]} />
                  <Legend />
                  <Bar dataKey="sales_rands" fill="#f97316" name="Sales (Rands)" />
                  <Bar dataKey="customer_count" fill="#3b82f6" name="Customers" />
                  <Bar dataKey="avg_price_per_kg" fill="#8b5cf6" name="P/Kg Average" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Order History (5 Weeks)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Product1" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="Product2" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Product3" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
