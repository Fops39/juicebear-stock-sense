import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SalesTrackingProps {
  isAdmin: boolean;
}

interface Sale {
  id: string;
  product: {
    name: string;
    category: string;
  };
  location: {
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_amount: number;
  sale_type: 'wholesale' | 'retail';
  created_at: string;
}

const SalesTracking = ({ isAdmin }: SalesTrackingProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSale, setNewSale] = useState({
    product_id: '',
    location_id: '',
    quantity: '',
    unit_price: '',
    sale_type: 'retail' as 'wholesale' | 'retail',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch sales
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        product:products(*),
        location:locations(*)
      `)
      .order('created_at', { ascending: false });

    if (salesError) {
      console.error('Error fetching sales:', salesError);
    } else {
      setSales(salesData || []);
    }

    // Fetch products and locations
    const [{ data: productsData }, { data: locationsData }] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('locations').select('*').eq('type', 'central_store')
    ]);

    setProducts(productsData || []);
    setLocations(locationsData || []);
    setLoading(false);
  };

  const createSale = async () => {
    const unitPrice = parseFloat(newSale.unit_price);
    const quantity = parseInt(newSale.quantity);
    const totalAmount = unitPrice * quantity;

    const { error } = await supabase
      .from('sales')
      .insert({
        product_id: newSale.product_id,
        location_id: newSale.location_id,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        sale_type: newSale.sale_type,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
      setShowCreateDialog(false);
      setNewSale({
        product_id: '',
        location_id: '',
        quantity: '',
        unit_price: '',
        sale_type: 'retail',
      });
      fetchData();
    }
  };

  const calculateTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.total_amount, 0);
  };

  const calculateTotalQuantitySold = () => {
    return sales.reduce((total, sale) => total + sale.quantity, 0);
  };

  const getSalesChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map(date => {
      const daysSales = sales.filter(sale => 
        new Date(sale.created_at).toDateString() === date
      );
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: daysSales.reduce((sum, sale) => sum + sale.total_amount, 0),
        quantity: daysSales.reduce((sum, sale) => sum + sale.quantity, 0),
      };
    });
  };

  const getSalesByCategory = () => {
    return sales.reduce((acc: any[], sale) => {
      const existing = acc.find(x => x.category === sale.product.category);
      if (existing) {
        existing.revenue += sale.total_amount;
        existing.quantity += sale.quantity;
      } else {
        acc.push({
          category: sale.product.category,
          revenue: sale.total_amount,
          quantity: sale.quantity,
        });
      }
      return acc;
    }, []);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const chartData = getSalesChartData();
  const categoryData = getSalesByCategory();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales Tracking</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={newSale.product_id} onValueChange={(value) => setNewSale({...newSale, product_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={newSale.location_id} onValueChange={(value) => setNewSale({...newSale, location_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Sale Type</Label>
                <Select value={newSale.sale_type} onValueChange={(value: 'wholesale' | 'retail') => setNewSale({...newSale, sale_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({...newSale, quantity: e.target.value})}
                    placeholder="Units sold"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Unit Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSale.unit_price}
                    onChange={(e) => setNewSale({...newSale, unit_price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <Button onClick={createSale} className="w-full">
                Record Sale
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalRevenue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalQuantitySold()}</div>
            <p className="text-xs text-muted-foreground">Total units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground">All sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sales.slice(0, 10).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{sale.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.location.name} • {new Date(sale.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${sale.total_amount.toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={sale.sale_type === 'wholesale' ? 'default' : 'secondary'}>
                      {sale.sale_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{sale.quantity} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTracking;