import React, { useState } from "react";
import {
  Calendar,
  CalendarCheck,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "./FileUpload";
import { ReportDisplay } from "./ReportDisplay";

const REPORT_MODES = [
  { value: "totals", label: "Daily Totals" },
  { value: "compare", label: "Compare Previous Period" },
];

const COMPARISON_PERIODS = [
  { value: "daily", label: "Today vs Yesterday" },
  { value: "weekly", label: "This Week vs Last Week" },
  { value: "monthly", label: "This Month vs Last Month" },
];

interface ReportData {
  date: string;
  total_sales: {
    total_mass: number;
    total_sales_value: number;
    price_per_kg: number;
    total_orders: number;
  };
  product_categories: Record<string, {
    sales_value: number;
    mass: number;
    mass_tons?: number;
  }>;
  customer_groups: Record<string, number>;
  top_customers: Record<string, number>;
  product_focus_lines: Record<string, {
    mass: string;
    customers: number;
  }>;
  comparison?: any;
}



export function JustconnectReportGenerator() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reportMode, setReportMode] = useState<string>("");
  const [comparisonPeriod, setComparisonPeriod] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleGenerateReport = async () => {
    if (!uploadedFile || !reportMode) {
      return;
    }

    if (reportMode === "compare" && !comparisonPeriod) {
      return;
    }

    setIsGenerating(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const endpoint = reportMode === "compare" 
        ? `/upload-excel?comparison_mode=true&period=${comparisonPeriod}`
        : '/upload-excel';

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      setReportData(result.report);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };



  const isFormValid = uploadedFile && reportMode && 
    (reportMode !== "compare" || comparisonPeriod);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Justconnect Sales Reports
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your daily Excel sales data and generate comprehensive reports with comparison analytics
        </p>
      </div>

      {/* Main Form */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Upload Sales Data
              </CardTitle>
              <CardDescription>
                Upload your daily Excel file containing sales data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={setUploadedFile}
                selectedFile={uploadedFile}
              />
            </CardContent>
          </Card>

          {/* Report Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Report Type
              </CardTitle>
              <CardDescription>
                Choose between daily totals or period comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-mode">Report Mode</Label>
                <Select value={reportMode} onValueChange={setReportMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportMode === "compare" && (
                <div className="space-y-2">
                  <Label htmlFor="comparison-period">Comparison Period</Label>
                  <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select comparison period" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPARISON_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>



          {/* Generate Button */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Generate Report
              </CardTitle>
              <CardDescription>
                Create your sales report with the selected options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGenerateReport}
                disabled={!isFormValid || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading... {Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full h-2" />
                  </div>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>

              {!isFormValid && (
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Please complete the following:</p>
                  <ul className="space-y-1 ml-4">
                    {!uploadedFile && <li>• Upload sales data file</li>}
                    {!reportMode && <li>• Select report mode</li>}
                    {reportMode === "compare" && !comparisonPeriod && (
                      <li>• Select comparison period</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Report Display */}
        <div className="space-y-6">
          {reportData && (
            <ReportDisplay data={reportData} mode={reportMode} />
          )}
        </div>
      </div>
    </div>
  );
}
