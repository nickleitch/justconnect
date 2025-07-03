'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

export default function SalesDirectorDashboard() {
  const [data, setData] = useState<SalesRecord[]>([])
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    supplier: '',
    customer: '',
    product: '',
    productCategory: '',
    rep: ''
  })
  const [loading, setLoading] = useState(true)

  const suppliers = ['Riversmead Poultry', 'Sala Pork', 'Midlands Eggs', 'Corona Cheese', 'Halaal Fresh Meats Beef', 'Topgrade Beef', 'Crest Choice']
  const customers = ['Customer 1', 'Customer 2', 'Customer 3']
  const categories = ['Category 1', 'Category 2', 'Category 3']
  const products = ['Product 1', 'Product 2', 'Product 3']
  const reps = ['Uriel', 'Lyle', 'Calvyn']

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const aggregatedData = await getAggregatedData({ ...filters, groupBy: 'product' })
      setData(aggregatedData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const totalSales = data.reduce((sum: number, item: SalesRecord) => sum + item.sales_rands, 0)
  const totalMass = data.reduce((sum: number, item: SalesRecord) => sum + item.mass_kg, 0)
  const totalCustomers = data.reduce((sum: number, item: SalesRecord) => sum + item.customer_count, 0)
  const avgPricePerKg = totalMass > 0 ? totalSales / totalMass : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sales Director Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Executive overview and performance metrics
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.productCategory}
                onChange={(e) => handleFilterChange('productCategory', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={filters.product}
                onChange={(e) => handleFilterChange('product', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Rep</label>
              <select
                value={filters.rep}
                onChange={(e) => handleFilterChange('rep', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Reps</option>
                {reps.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
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
                <p className="text-sm font-medium text-gray-600">Total Sales (MTD)</p>
                <p className="text-2xl font-bold text-gray-900">R{totalSales.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mass (MTD)</p>
                <p className="text-2xl font-bold text-gray-900">{totalMass.toLocaleString()} kg</p>
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
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price/Kg</p>
                <p className="text-2xl font-bold text-gray-900">R{avgPricePerKg.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Performance by Product</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'sales_rands' ? `R${value.toLocaleString()}` : value,
                  name === 'sales_rands' ? 'Sales (Rands)' : 
                  name === 'mass_kg' ? 'Mass (kg)' : 
                  name === 'customer_count' ? 'Customers' : name
                ]} />
                <Legend />
                <Bar dataKey="sales_rands" fill="#10b981" name="Sales (Rands)" />
                <Bar dataKey="mass_kg" fill="#3b82f6" name="Mass (kg)" />
                <Bar dataKey="customer_count" fill="#8b5cf6" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
