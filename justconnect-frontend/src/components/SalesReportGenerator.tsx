import React, { useState } from "react";
import {
  Calendar,
  CalendarCheck,
  FileSpreadsheet,
  Send,
  Users,
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { FileUpload } from "./FileUpload";
import { DateRangePicker } from "./DateRangePicker";

interface Agent {
  id: string;
  name: string;
  email: string;
  department: string;
}

const SALES_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "Enterprise Sales",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "michael.rodriguez@company.com",
    department: "SMB Sales",
  },
  {
    id: "3",
    name: "Emily Watson",
    email: "emily.watson@company.com",
    department: "Regional Sales",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@company.com",
    department: "Inside Sales",
  },
  {
    id: "5",
    name: "Jessica Martinez",
    email: "jessica.martinez@company.com",
    department: "Key Accounts",
  },
];

const REPORT_PERIODS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

export function SalesReportGenerator() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reportPeriod, setReportPeriod] = useState<string>("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId],
    );
  };

  const handleSelectAll = () => {
    setSelectedAgents(
      selectedAgents.length === SALES_AGENTS.length
        ? []
        : SALES_AGENTS.map((agent) => agent.id),
    );
  };

  const handleGenerateReport = async () => {
    if (!uploadedFile || !reportPeriod || selectedAgents.length === 0) {
      return;
    }

    if (reportPeriod === "custom" && (!dateRange.from || !dateRange.to)) {
      return;
    }

    setIsGenerating(true);
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);

    // Here you would typically call your backend API to generate and send the report
    console.log("Generating report with:", {
      file: uploadedFile.name,
      period: reportPeriod,
      dateRange,
      agents: selectedAgents,
    });
  };

  const isFormValid =
    uploadedFile &&
    reportPeriod &&
    selectedAgents.length > 0 &&
    (reportPeriod !== "custom" || (dateRange.from && dateRange.to));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Sales Report Generator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your sales data and generate custom reports to send to your
          sales team
        </p>
      </div>

      {/* Main Form */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Upload Sales Data
              </CardTitle>
              <CardDescription>
                Upload an Excel file containing your sales database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={setUploadedFile}
                selectedFile={uploadedFile}
              />
            </CardContent>
          </Card>

          {/* Report Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Report Period
              </CardTitle>
              <CardDescription>
                Select the time period for your sales report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-period">Time Period</Label>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report period" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_PERIODS.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportPeriod === "custom" && (
                <div className="space-y-2">
                  <Label>Custom Date Range</Label>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Agent Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Send To Sales Agents
              </CardTitle>
              <CardDescription>
                Select which sales agents should receive this report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Recipients</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  type="button"
                >
                  {selectedAgents.length === SALES_AGENTS.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {SALES_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={agent.id}
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={() => handleAgentToggle(agent.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={agent.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {agent.name}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {agent.department}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {agent.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedAgents.length > 0 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedAgents.length} agent
                  {selectedAgents.length !== 1 ? "s" : ""} selected
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Generate & Send Report
              </CardTitle>
              <CardDescription>
                Generate the sales report and send it to selected agents
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
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Generate & Send Report
                  </>
                )}
              </Button>

              {!isFormValid && (
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">Please complete the following:</p>
                  <ul className="space-y-1 ml-4">
                    {!uploadedFile && <li>• Upload sales data file</li>}
                    {!reportPeriod && <li>• Select report period</li>}
                    {reportPeriod === "custom" &&
                      (!dateRange.from || !dateRange.to) && (
                        <li>• Select custom date range</li>
                      )}
                    {selectedAgents.length === 0 && (
                      <li>• Select at least one sales agent</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
