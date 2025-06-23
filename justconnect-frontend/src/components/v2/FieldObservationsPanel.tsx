import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockFieldObservations, type FieldObservation } from '@/lib/mockData';

export function FieldObservationsPanel() {
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    competitor_products: '',
    out_of_stock_items: '',
    customer_feedback: '',
    pricing_notes: '',
    foot_traffic: 'medium'
  });

  useEffect(() => {
    setTimeout(() => {
      setObservations(mockFieldObservations);
      setLoading(false);
    }, 500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newObservation: FieldObservation = {
      id: Date.now().toString(),
      customer_id: formData.customer_id,
      customer_name: formData.customer_name,
      rep_id: 'REP001',
      visit_date: new Date().toISOString().split('T')[0],
      competitor_products: formData.competitor_products.split(',').map(p => p.trim()).filter(Boolean),
      out_of_stock_items: formData.out_of_stock_items.split(',').map(p => p.trim()).filter(Boolean),
      customer_feedback: formData.customer_feedback,
      pricing_notes: formData.pricing_notes,
      foot_traffic: formData.foot_traffic as 'low' | 'medium' | 'high'
    };

    setObservations([newObservation, ...observations]);
    setFormData({
      customer_id: '',
      customer_name: '',
      competitor_products: '',
      out_of_stock_items: '',
      customer_feedback: '',
      pricing_notes: '',
      foot_traffic: 'medium'
    });
    setShowForm(false);
    alert('Observation recorded successfully!');
  };

  const getTrafficBadgeVariant = (traffic: string) => {
    switch (traffic) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading field observations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Field Intelligence</CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Observation
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Customer ID</Label>
                  <Input
                    id="customer_id"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="competitor_products">Competitor Products (comma-separated)</Label>
                <Input
                  id="competitor_products"
                  value={formData.competitor_products}
                  onChange={(e) => setFormData({...formData, competitor_products: e.target.value})}
                  placeholder="Rainbow Chicken, Country Fair"
                />
              </div>
              
              <div>
                <Label htmlFor="out_of_stock_items">Out of Stock Items (comma-separated)</Label>
                <Input
                  id="out_of_stock_items"
                  value={formData.out_of_stock_items}
                  onChange={(e) => setFormData({...formData, out_of_stock_items: e.target.value})}
                  placeholder="CCAR, D6-F"
                />
              </div>
              
              <div>
                <Label htmlFor="customer_feedback">Customer Feedback</Label>
                <Textarea
                  id="customer_feedback"
                  value={formData.customer_feedback}
                  onChange={(e) => setFormData({...formData, customer_feedback: e.target.value})}
                  placeholder="Any feedback or comments from the customer..."
                />
              </div>
              
              <div>
                <Label htmlFor="pricing_notes">Pricing Observations</Label>
                <Textarea
                  id="pricing_notes"
                  value={formData.pricing_notes}
                  onChange={(e) => setFormData({...formData, pricing_notes: e.target.value})}
                  placeholder="Note any pricing feedback or competitor pricing..."
                />
              </div>
              
              <div>
                <Label htmlFor="foot_traffic">Foot Traffic Level</Label>
                <Select value={formData.foot_traffic} onValueChange={(value) => setFormData({...formData, foot_traffic: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">Submit Observation</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {observations.map((observation) => (
              <Card key={observation.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{observation.customer_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {observation.visit_date} • Rep: {observation.rep_id}
                      </p>
                    </div>
                    <Badge variant={getTrafficBadgeVariant(observation.foot_traffic) as any}>
                      {observation.foot_traffic} traffic
                    </Badge>
                  </div>
                  
                  {observation.competitor_products.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Competitors: </span>
                      <span className="text-sm">{observation.competitor_products.join(', ')}</span>
                    </div>
                  )}
                  
                  {observation.out_of_stock_items.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-red-600">Out of Stock: </span>
                      <span className="text-sm">{observation.out_of_stock_items.join(', ')}</span>
                    </div>
                  )}
                  
                  {observation.customer_feedback && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Feedback: </span>
                      <span className="text-sm">{observation.customer_feedback}</span>
                    </div>
                  )}
                  
                  {observation.pricing_notes && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Pricing: </span>
                      <span className="text-sm">{observation.pricing_notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
