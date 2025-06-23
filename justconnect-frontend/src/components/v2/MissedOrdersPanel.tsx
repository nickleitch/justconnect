import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Calendar, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockMissedOrders, type MissedOrder } from '@/lib/mockData';

export function MissedOrdersPanel() {
  const [orders, setOrders] = useState<MissedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockMissedOrders);
      setLoading(false);
    }, 500);
  }, []);

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleCall = (customerId: string) => {
    alert(`Calling customer: ${customerId}`);
  };

  const handleScheduleVisit = (customerId: string) => {
    alert(`Scheduling visit for customer: ${customerId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading missed orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Missed Orders - Immediate Action Required</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Days Overdue</TableHead>
              <TableHead>Expected Value</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.customer_name}
                </TableCell>
                <TableCell>
                  {order.customer_type.replace('_', ' ')}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-orange-600">
                    {order.days_overdue} days
                  </span>
                </TableCell>
                <TableCell>
                  ${order.expected_order_value.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(order.risk_level) as any}>
                    {order.risk_level}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.last_order_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCall(order.account_number)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScheduleVisit(order.account_number)}
                    >
                      <Calendar className="h-4 w-4" />
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
