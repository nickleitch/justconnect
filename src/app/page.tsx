'use client'

import Link from "next/link"
import { Upload, BarChart3, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JFT Sales Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your sales data and analyze performance across multiple dashboards with year-over-year comparisons
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/upload" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Data</h3>
              <p className="text-gray-600">Upload your latest sales data from Qlik Sense</p>
            </div>
          </Link>

          <Link href="/dashboard/sales-director" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Director</h3>
              <p className="text-gray-600">Executive overview and performance metrics</p>
            </div>
          </Link>

          <Link href="/dashboard/sales-manager" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Manager</h3>
              <p className="text-gray-600">In-store performance for Uriel, Lyle, Calvyn</p>
            </div>
          </Link>

          <Link href="/dashboard/sales-trader" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 group-hover:bg-orange-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Trader</h3>
              <p className="text-gray-600">Office performance for Bruce, Preshantha</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
              <h3 className="font-semibold mb-2">Upload Sales Data</h3>
              <p className="text-gray-600 text-sm">Upload your CSV file from Qlik Sense with the latest sales data</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
              <h3 className="font-semibold mb-2">Choose Dashboard</h3>
              <p className="text-gray-600 text-sm">Select the appropriate dashboard for your role and analysis needs</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
              <h3 className="font-semibold mb-2">Analyze Performance</h3>
              <p className="text-gray-600 text-sm">Use filters and year-over-year comparisons to gain insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
