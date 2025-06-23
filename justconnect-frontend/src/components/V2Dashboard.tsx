import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Eye, Upload } from 'lucide-react';
import { MissedOrdersPanel } from '@/components/v2/MissedOrdersPanel';
import { RangeOpportunitiesPanel } from '@/components/v2/RangeOpportunitiesPanel';
import { FieldObservationsPanel } from '@/components/v2/FieldObservationsPanel';
import { ExcelUploader } from '@/components/v2/ExcelUploader';

export function V2Dashboard() {
  const [stats, setStats] = useState({
    missedOrders: 12,
    potentialRevenue: 45600,
    activeAlerts: 5,
    processingStatus: 'ready'
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Sales Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time insights to maximize sales opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Missed Orders
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.missedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Customers overdue for orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Potential Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.potentialRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From missed orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High Risk Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate action
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Processing Status
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {stats.processingStatus}
              </div>
              <p className="text-xs text-muted-foreground">
                System status
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Data Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <ExcelUploader />
          </CardContent>
        </Card>

        <Tabs defaultValue="missed-orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="missed-orders">Missed Orders</TabsTrigger>
            <TabsTrigger value="range-gaps">Range Opportunities</TabsTrigger>
            <TabsTrigger value="field-intel">Field Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="missed-orders">
            <MissedOrdersPanel />
          </TabsContent>

          <TabsContent value="range-gaps">
            <RangeOpportunitiesPanel />
          </TabsContent>

          <TabsContent value="field-intel">
            <FieldObservationsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
