import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockRangeOpportunities, type RangeOpportunity } from '@/lib/mockData';

export function RangeOpportunitiesPanel() {
  const [opportunities, setOpportunities] = useState<RangeOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOpportunities(mockRangeOpportunities);
      setLoading(false);
    }, 500);
  }, []);

  const getAdoptionBadgeVariant = (rate: number) => {
    if (rate >= 0.8) return 'default';
    if (rate >= 0.6) return 'secondary';
    return 'outline';
  };

  const handleCreatePitch = (opportunityId: string) => {
    alert(`Creating sales pitch for opportunity: ${opportunityId}`);
  };

  const handleScheduleDemo = (customerId: string, productCode: string) => {
    alert(`Scheduling product demo for customer: ${customerId}, product: ${productCode}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading range opportunities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Range Expansion Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Adoption Rate</TableHead>
              <TableHead>Monthly Value</TableHead>
              <TableHead>Similar Customers</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{opportunity.customer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {opportunity.customer_type.replace('_', ' ')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{opportunity.product_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {opportunity.product_code}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getAdoptionBadgeVariant(opportunity.adoption_rate) as any}>
                    {(opportunity.adoption_rate * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-green-600">
                    R{opportunity.potential_monthly_value.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{opportunity.similar_customers_count}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreatePitch(opportunity.id)}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScheduleDemo(opportunity.account_number, opportunity.product_code)}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
