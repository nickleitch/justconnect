import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Users, Package, DollarSign, Calendar, Upload, FileSpreadsheet } from 'lucide-react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface DashboardData {
  suppliers?: any[]
  customers?: any[]
  products?: any[]
  categories?: any[]
  order_history?: any[]
  summary?: any
}

interface FilterOptions {
  years: number[]
  months: number[]
  reps: string[]
  suppliers: string[]
  customers: string[]
  categories: string[]
}

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="bg-blue-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">JFT Sales Dashboard</h1>
        <div className="flex space-x-4">
          <Link 
            to="/sales-director" 
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === '/sales-director' ? 'bg-blue-700' : 'hover:bg-blue-800'
            }`}
          >
            Sales Director
          </Link>
          <Link 
            to="/sales-manager" 
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === '/sales-manager' ? 'bg-blue-700' : 'hover:bg-blue-800'
            }`}
          >
            Sales Manager
          </Link>
          <Link 
            to="/sales-trader" 
            className={`px-4 py-2 rounded transition-colors ${
              location.pathname === '/sales-trader' ? 'bg-blue-700' : 'hover:bg-blue-800'
            }`}
          >
            Sales Trader
          </Link>
        </div>
      </div>
    </nav>
  )
}

function FilterPanel({ filters, onFilterChange }: {
  filters: FilterOptions
  onFilterChange: (key: string, value: string) => void
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Year</label>
            <Select onValueChange={(value) => onFilterChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {filters.years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Month</label>
            <Select onValueChange={(value) => onFilterChange('month', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {filters.months.map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Rep</label>
            <Select onValueChange={(value) => onFilterChange('rep', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Rep" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reps</SelectItem>
                {filters.reps.map(rep => (
                  <SelectItem key={rep} value={rep}>{rep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select onValueChange={(value) => onFilterChange('sort_by', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales_value">Sales Value</SelectItem>
                <SelectItem value="mass">Mass (Kg)</SelectItem>
                <SelectItem value="growth_rands_pct">Growth %</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({ title, value, change, icon: Icon, format = 'currency' }: {
  title: string
  value: number
  change?: number
  icon: any
  format?: 'currency' | 'number' | 'percentage'
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `R${val.toLocaleString()}`
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`
      default:
        return val.toLocaleString()
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(change * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  )
}

function SalesDirectorDashboard() {
  const [data, setData] = useState<DashboardData>({})
  const [filters, setFilters] = useState<FilterOptions>({
    years: [], months: [], reps: [], suppliers: [], customers: [], categories: []
  })
  const [selectedFilters, setSelectedFilters] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFilters()
    fetchData()
  }, [selectedFilters])

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/filters`)
      const filterData = await response.json()
      setFilters(filterData)
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const fetchData = async () => {
    try {
      console.log('Sales Director fetchData running, API_BASE_URL:', API_BASE_URL)
      const params = new URLSearchParams()
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value as string)
      })
      
      const url = `${API_BASE_URL}/api/sales-director-dashboard?${params}`
      console.log('Fetching from URL:', url)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      const dashboardData = await response.json()
      console.log('Dashboard data received:', dashboardData)
      setData(dashboardData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Sales Director Dashboard</h2>
      
      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Sales"
          value={data.summary?.total_sales || 0}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Mass (Kg)"
          value={data.summary?.total_mass || 0}
          icon={Package}
          format="number"
        />
        <MetricCard
          title="Avg Price/Kg"
          value={data.summary?.avg_price_per_kg || 0}
          icon={TrendingUp}
          format="currency"
        />
        <MetricCard
          title="Records"
          value={data.summary?.record_count || 0}
          icon={Users}
          format="number"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance</CardTitle>
          <CardDescription>Month-to-date performance by supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Sales (MTD)</TableHead>
                <TableHead>Growth %</TableHead>
                <TableHead>Mass (Kg)</TableHead>
                <TableHead>Avg Price/Kg</TableHead>
                <TableHead>Price Growth %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.suppliers?.map((supplier, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{supplier.customer_group}</TableCell>
                  <TableCell>R{supplier.sales_rands_mtd?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={supplier.growth_rands_pct >= 0 ? "default" : "destructive"}>
                      {(supplier.growth_rands_pct * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{supplier.mass_kgs_mtd?.toLocaleString()}</TableCell>
                  <TableCell>R{supplier.avg_price_per_kg?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={supplier.price_growth_pct >= 0 ? "default" : "destructive"}>
                      {(supplier.price_growth_pct * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function SalesManagerDashboard() {
  const [data, setData] = useState<DashboardData>({})
  const [filters, setFilters] = useState<FilterOptions>({
    years: [], months: [], reps: [], suppliers: [], customers: [], categories: []
  })
  const [selectedFilters, setSelectedFilters] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFilters()
    fetchData()
  }, [selectedFilters])

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/filters`)
      const filterData = await response.json()
      setFilters(filterData)
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value as string)
      })
      
      const response = await fetch(`${API_BASE_URL}/api/sales-manager-dashboard?${params}`)
      const dashboardData = await response.json()
      setData(dashboardData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Sales Manager Dashboard</h2>
      
      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Sales"
          value={data.summary?.total_sales || 0}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Mass (Kg)"
          value={data.summary?.total_mass || 0}
          icon={Package}
          format="number"
        />
        <MetricCard
          title="Unique Customers"
          value={data.summary?.unique_customers || 0}
          icon={Users}
          format="number"
        />
        <MetricCard
          title="Unique Products"
          value={data.summary?.unique_products || 0}
          icon={Package}
          format="number"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Growth %</TableHead>
                  <TableHead>Days Since Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.customers?.slice(0, 5).map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{customer.customer}</TableCell>
                    <TableCell>R{customer.sales_value?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={customer.growth_rands_pct >= 0 ? "default" : "destructive"}>
                        {(customer.growth_rands_pct * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.days_since_last_order}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Growth %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products?.slice(0, 5).map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.product}</TableCell>
                    <TableCell>R{product.sales_value?.toLocaleString()}</TableCell>
                    <TableCell>{product.customer}</TableCell>
                    <TableCell>
                      <Badge variant={product.growth_rands_pct >= 0 ? "default" : "destructive"}>
                        {(product.growth_rands_pct * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Sales (MTD)</TableHead>
                <TableHead>Growth %</TableHead>
                <TableHead>Mass (Kg)</TableHead>
                <TableHead>Avg Price/Kg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.categories?.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.category}</TableCell>
                  <TableCell>R{category.sales_value?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={category.growth_rands_pct >= 0 ? "default" : "destructive"}>
                      {(category.growth_rands_pct * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{category.mass?.toLocaleString()}</TableCell>
                  <TableCell>R{category.price_per_kg?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function SalesTraderDashboard() {
  const [data, setData] = useState<DashboardData>({})
  const [filters, setFilters] = useState<FilterOptions>({
    years: [], months: [], reps: [], suppliers: [], customers: [], categories: []
  })
  const [selectedFilters, setSelectedFilters] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFilters()
    fetchData()
  }, [selectedFilters])

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/filters`)
      const filterData = await response.json()
      setFilters(filterData)
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value as string)
      })
      
      const response = await fetch(`${API_BASE_URL}/api/sales-trader-dashboard?${params}`)
      const dashboardData = await response.json()
      setData(dashboardData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Sales Trader Dashboard</h2>
      
      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard
          title="Total Sales"
          value={data.summary?.total_sales || 0}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Mass (Kg)"
          value={data.summary?.total_mass || 0}
          icon={Package}
          format="number"
        />
        <MetricCard
          title="Unique Customers"
          value={data.summary?.unique_customers || 0}
          icon={Users}
          format="number"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sales Growth %</TableHead>
                  <TableHead>Kg Growth %</TableHead>
                  <TableHead>Days Since Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.customers?.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{customer.customer}</TableCell>
                    <TableCell>
                      <Badge variant={customer.growth_rands_pct >= 0 ? "default" : "destructive"}>
                        {(customer.growth_rands_pct * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.growth_kg_pct >= 0 ? "default" : "destructive"}>
                        {(customer.growth_kg_pct * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.days_since_last_order}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Order History (5 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>5W</TableHead>
                  <TableHead>4W</TableHead>
                  <TableHead>3W</TableHead>
                  <TableHead>2W</TableHead>
                  <TableHead>1W</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.order_history?.map((history, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{history.product}</TableCell>
                    <TableCell>{history.week_5}</TableCell>
                    <TableCell>{history.week_4}</TableCell>
                    <TableCell>{history.week_3}</TableCell>
                    <TableCell>{history.week_2}</TableCell>
                    <TableCell>{history.week_1}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HomePage() {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus('Please select an Excel file (.xlsx or .xls)')
      return
    }

    setUploading(true)
    setUploadStatus('Processing Excel file...')

    try {
      setUploadStatus(`
        Excel file upload requires specific format. Please ensure your Excel file has these columns:
        Date, Transaction Type, Customer, Product, Mass, Sales Value, Price per Kg, Category, Customer Group.
        
        For now, please convert your Excel file to match the sample data format and contact support for bulk upload assistance.
      `)
      setUploading(false)
      
      event.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">JFT Sales Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive sales performance tracking and analytics
        </p>
      </div>

      {/* File Upload Section */}
      <div className="mb-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6" />
              Upload Sales Data
            </CardTitle>
            <CardDescription>
              Upload Excel files containing your sales data for the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Click to select or drag and drop your Excel file
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports .xlsx and .xls files
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {uploadStatus && (
                <div className={`text-sm p-3 rounded ${
                  uploadStatus.includes('failed') || uploadStatus.includes('Please select') 
                    ? 'bg-red-50 text-red-700' 
                    : uploadStatus.includes('success') 
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {uploadStatus}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/sales-director">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Sales Director Dashboard
              </CardTitle>
              <CardDescription>
                Supplier performance metrics and growth analysis
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link to="/sales-manager">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Sales Manager Dashboard
              </CardTitle>
              <CardDescription>
                Customer and product performance for in-store teams
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link to="/sales-trader">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Sales Trader Dashboard
              </CardTitle>
              <CardDescription>
                Customer order history and growth tracking for office teams
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sales-director" element={<SalesDirectorDashboard />} />
          <Route path="/sales-manager" element={<SalesManagerDashboard />} />
          <Route path="/sales-trader" element={<SalesTraderDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
