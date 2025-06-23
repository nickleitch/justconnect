import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ReportDisplayProps {
  data: any;
  mode: string;
}

export function ReportDisplay({ data, mode }: ReportDisplayProps) {
  if (mode === "compare") {
    return <ComparisonReport data={data} />;
  }
  
  return <TotalsReport data={data} />;
}

function TotalsReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">URIEL Riversmead Sales</CardTitle>
          <p className="text-lg text-muted-foreground">Date: {data.date}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Total Sales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mass</p>
                <p className="text-xl font-bold">{data.total_sales.total_mass.toFixed(1)}kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Value</p>
                <p className="text-xl font-bold">R{data.total_sales.total_sales_value.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price/Kg</p>
                <p className="text-xl font-bold">R{data.total_sales.price_per_kg.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-xl font-bold">{data.total_sales.total_orders}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Product Categories</h3>
            <div className="space-y-2">
              {Object.entries(data.product_categories).map(([category, values]: [string, any]) => (
                <div key={category} className="flex justify-between items-center p-2 rounded border">
                  <span className="font-medium">{category}:</span>
                  <div className="text-right">
                    <span className="font-bold">R{values.sales_value.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground ml-2">({values.mass.toFixed(1)}kg)</span>
                    {values.mass_tons && (
                      <span className="text-sm text-muted-foreground ml-1">({values.mass_tons}T)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Customer Groups</h3>
            <div className="space-y-2">
              {Object.entries(data.customer_groups).map(([group, value]: [string, any], index) => (
                <div key={group} className="flex justify-between items-center p-2 rounded border">
                  <span className="font-medium">{index + 1}. {group}:</span>
                  <span className="font-bold">R{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Top 5 Customers</h3>
            <div className="space-y-2">
              {Object.entries(data.top_customers).map(([customer, value]: [string, any], index) => (
                <div key={customer} className="flex justify-between items-center p-2 rounded border">
                  <span className="font-medium">{index + 1}. {customer}:</span>
                  <span className="font-bold">R{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Product Focus Lines</h3>
            <div className="space-y-2">
              {Object.entries(data.product_focus_lines).map(([product, details]: [string, any], index) => (
                <div key={product} className="p-2 rounded border">
                  <div className="font-medium text-sm">
                    {index + 1}. {product}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {details.mass} ({details.customers} customers)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComparisonReport({ data }: { data: any }) {
  const getChangeIcon = (change: string) => {
    if (change === "no comp" || change === "0%") {
      return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
    const numericChange = parseFloat(change.replace('%', ''));
    if (numericChange > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getChangeColor = (change: string) => {
    if (change === "no comp" || change === "0%") {
      return "text-muted-foreground";
    }
    const numericChange = parseFloat(change.replace('%', ''));
    if (numericChange > 0) {
      return "text-green-600";
    }
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">URIEL Riversmead Sales</CardTitle>
          <p className="text-lg text-muted-foreground">Date: {data.date}</p>
          <Badge variant="outline" className="w-fit">
            {data.comparison.period_name}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Total Sales</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Mass:</span>
                <div className="flex items-center gap-2">
                  {getChangeIcon(data.comparison.total_sales.mass.split(' ')[0])}
                  <span className={`font-bold ${getChangeColor(data.comparison.total_sales.mass.split(' ')[0])}`}>
                    {data.comparison.total_sales.mass}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>P/Kg:</span>
                <div className="flex items-center gap-2">
                  {getChangeIcon(data.comparison.total_sales.price_per_kg.split(' ')[0])}
                  <span className={`font-bold ${getChangeColor(data.comparison.total_sales.price_per_kg.split(' ')[0])}`}>
                    {data.comparison.total_sales.price_per_kg}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Product Category</h3>
            <div className="space-y-2">
              {Object.entries(data.comparison.product_categories).map(([category, values]: [string, any]) => (
                <div key={category} className="flex justify-between items-center p-2 rounded border">
                  <span className="font-medium">{category}:</span>
                  <div className="flex items-center gap-2">
                    {getChangeIcon(values.percentage_change)}
                    <span className={`font-bold ${getChangeColor(values.percentage_change)}`}>
                      {values.percentage_change}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      (R{values.current_total.toFixed(2)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Customer Grp Growth</h3>
            <div className="space-y-2">
              {Object.entries(data.comparison.customer_groups)
                .sort(([,a]: [string, any], [,b]: [string, any]) => b.current_total - a.current_total)
                .map(([group, values]: [string, any], index) => (
                <div key={group} className="flex justify-between items-center p-2 rounded border">
                  <span className="font-medium">{index + 1}. {group}:</span>
                  <div className="flex items-center gap-2">
                    {getChangeIcon(values.percentage_change)}
                    <span className={`font-bold ${getChangeColor(values.percentage_change)}`}>
                      {values.percentage_change}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      (R{values.current_total.toFixed(2)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
