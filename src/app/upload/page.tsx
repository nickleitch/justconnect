'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setStatus('idle')
      setMessage('')
    } else {
      setMessage('Please select a valid CSV file')
      setStatus('error')
    }
  }, [])

  const processCSVData = (csvData: Record<string, unknown>[]) => {
    return csvData.map(row => {
      let rKgValue = 0
      const rKgRaw = row['R/KG']?.toString().trim()
      if (rKgRaw && rKgRaw !== '-' && rKgRaw !== '') {
        const parsed = parseFloat(rKgRaw.replace(/,/g, ''))
        rKgValue = isNaN(parsed) ? 0 : parsed
      }

      let massValue = 0
      const massRaw = row['Mass']?.toString().trim()
      if (massRaw && massRaw !== '-' && massRaw !== '') {
        const parsed = parseFloat(massRaw.replace(/,/g, ''))
        massValue = isNaN(parsed) ? 0 : parsed
      }

      let formattedDate = ''
      const dateRaw = row['Date']?.toString().trim()
      if (dateRaw) {
        try {
          const date = new Date(dateRaw)
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0] // YYYY-MM-DD format
          }
        } catch {
          console.warn('Invalid date:', dateRaw)
        }
      }

      return {
        invoice_number: parseInt(row['Invoice Number']?.toString() || '0') || 0,
        transaction_type: (row['Transaction Type'] || '').toString().substring(0, 50), // Limit length
        date: formattedDate,
        account_number: (row['Account Number'] || '').toString().substring(0, 50),
        customer: (row['Customer'] || '').toString().substring(0, 100),
        product: (row['Product'] || '').toString().substring(0, 100),
        mass: Math.round(massValue), // Ensure integer
        sales_value: Math.round(parseFloat(row['Sales Value']?.toString().replace(/,/g, '') || '0') * 100) / 100, // Round to 2 decimals
        sales_qty: parseInt(row['Sales Qty']?.toString() || '0') || 0,
        r_kg: Math.round(rKgValue * 100) / 100 // Round to 2 decimals
      }
    })
  }

  const uploadData = async () => {
    if (!file) return

    setUploading(true)
    setStatus('uploading')
    setProgress(0)
    setMessage('Reading CSV file...')

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          setProgress(25)
          setMessage('Processing data...')

          const processedData = processCSVData(results.data as Record<string, unknown>[])
          console.log('Processed data sample:', processedData.slice(0, 3))
          console.log('Total processed records:', processedData.length)
          
          setProgress(50)
          setMessage('Uploading to database...')

          await supabase.from('sales_data').delete().neq('id', 0)
          
          setProgress(75)
          setMessage('Inserting new data...')

          const batchSize = 1000
          for (let i = 0; i < processedData.length; i += batchSize) {
            const batch = processedData.slice(i, i + batchSize)
            const { error } = await supabase
              .from('sales_data')
              .insert(batch)
            
            if (error) {
              throw error
            }
            
            const currentProgress = 75 + (25 * (i + batchSize) / processedData.length)
            setProgress(Math.min(currentProgress, 100))
          }

          setProgress(100)
          setStatus('success')
          setMessage(`Successfully uploaded ${processedData.length} records`)
          
          setTimeout(() => {
            router.push('/dashboard/sales-director')
          }, 2000)
        },
        error: (parseError) => {
          setStatus('error')
          setMessage(`Error parsing CSV: ${parseError.message}`)
          setUploading(false)
        }
      })
    } catch (error: unknown) {
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessage(`Upload failed: ${errorMessage}`)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upload Sales Data
            </h1>
            <p className="text-lg text-gray-600">
              Upload your CSV file from Qlik Sense to update the sales dashboard
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="sr-only"
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
              </div>
            </div>

            {file && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}

            {uploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-sm text-green-800">{message}</span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-sm text-red-800">{message}</span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={uploadData}
                disabled={!file || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Data
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
