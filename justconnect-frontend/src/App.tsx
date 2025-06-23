import { useState } from 'react'
import { Upload, FileText, TrendingUp, Users, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ReportData {
  date: string
  total_sales: {
    total_mass: number
    total_sales_value: number
    price_per_kg: number
    total_orders: number
  }
  product_categories: {
    [key: string]: {
      sales_value: number
      mass: number
      mass_tons?: number
    }
  }
  customer_groups: {
    [key: string]: number
  }
  top_customers: {
    [key: string]: number
  }
  product_focus_lines: {
    [key: string]: {
      mass: string
      customers: number
    }
  }
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/upload-excel`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      setReport(data.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Justconnect</h1>
          <p className="text-lg text-gray-600">Daily Sales Report Generator</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
            <CardDescription>
              Upload your daily invoice line detail Excel file to generate a comprehensive sales report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : 'Choose Excel file'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Click to browse or drag and drop your .xlsx or .xls file
                  </p>
                </label>
              </div>
              
              {file && (
                <Button 
                  onClick={handleUpload} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Generate Report'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {report && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">URIEL Riversmead Sales</CardTitle>
                <CardDescription>Date: {report.date}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Mass:</span>
                      <span className="text-blue-600 font-medium">
                        {report.total_sales.total_mass}kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>P/Kg:</span>
                      <span className="text-blue-600 font-medium">
                        R{report.total_sales.price_per_kg}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Sales:</span>
                      <span className="text-green-600 font-medium">
                        R{report.total_sales.total_sales_value}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders:</span>
                      <span className="text-gray-600 font-medium">
                        {report.total_sales.total_orders}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(report.product_categories).map(([category, data]) => (
                      <div key={category} className="flex justify-between">
                        <span>{category}:</span>
                        <span className="text-blue-600 font-medium">
                          R{data.sales_value} ({data.mass}kg)
                          {data.mass_tons && ` (${data.mass_tons}T)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Group Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(report.customer_groups).slice(0, 6).map(([group, sales], index) => (
                      <div key={group} className="flex justify-between">
                        <span>{index + 1}. {group}:</span>
                        <span className="text-green-600 font-medium">
                          R{sales}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 customers:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(report.top_customers).map(([customer, sales], index) => (
                      <div key={customer} className="flex justify-between">
                        <span className="truncate mr-2">{index + 1}. {customer}:</span>
                        <span className="text-green-600 font-medium">
                          R{sales}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Focus Lines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(report.product_focus_lines).map(([product, data], index) => (
                      <div key={product} className="space-y-1">
                        <div className="font-medium">{index + 1}. {product}:</div>
                        <div className="text-gray-600 ml-4">
                          {data.mass} ({data.customers} customers)
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
