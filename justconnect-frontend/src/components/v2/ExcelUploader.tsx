import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export function ExcelUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    if (excelFile) {
      handleFileUpload(excelFile);
    } else {
      alert('Please upload an Excel file (.xlsx or .xls)');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setUploadStatus('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResult = {
      status: 'success',
      transactions_processed: 195432,
      customers_updated: 1247,
      alerts_generated: 23,
      opportunities_found: 67,
      processing_time_ms: 3450
    };

    setUploadResult(mockResult);
    setUploadStatus('success');
  };

  const resetUploader = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadResult(null);
  };

  return (
    <div className="space-y-4">
      {uploadStatus === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload Daily Sales Data
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your Excel file here, or click to browse
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </span>
            </Button>
          </label>
        </div>
      )}

      {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
        <div className="space-y-4">
          <div className="text-center">
            <FileSpreadsheet className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <p className="font-medium">
              {uploadStatus === 'uploading' ? 'Uploading file...' : 'Processing data...'}
            </p>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {uploadStatus === 'success' && uploadResult && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              File processed successfully! {uploadResult.transactions_processed.toLocaleString()} transactions processed.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {uploadResult.transactions_processed.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {uploadResult.customers_updated.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {uploadResult.alerts_generated}
              </div>
              <div className="text-sm text-gray-600">Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {uploadResult.opportunities_found}
              </div>
              <div className="text-sm text-gray-600">Opportunities</div>
            </div>
          </div>
          
          <Button onClick={resetUploader} variant="outline" className="w-full">
            Upload Another File
          </Button>
        </div>
      )}

      {uploadStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to process file. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
