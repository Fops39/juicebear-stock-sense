import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Warehouse, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface InventoryOverviewProps {
  isAdmin: boolean;
}

interface InventoryItem {
  id: string;
  product: {
    name: string;
    category: string;
  };
  location: {
    name: string;
    type: string;
  };
  quantity: number;
  expiration_date: string;
}

interface StatsData {
  totalProducts: number;
  lowStockItems: number;
  expiringSoon: number;
  totalValue: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const InventoryOverview = ({ isAdmin }: InventoryOverviewProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    lowStockItems: 0,
    expiringSoon: 0,
    totalValue: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    
    const { data: inventoryData, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*),
        location:locations(*)
      `)
      .order('quantity', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
    } else {
      setInventory(inventoryData || []);
      
      // Calculate stats
      const totalProducts = inventoryData?.length || 0;
      const lowStockItems = inventoryData?.filter(item => item.quantity < 10).length || 0;
      const expiringSoon = inventoryData?.filter(item => {
        const expirationDate = new Date(item.expiration_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expirationDate <= thirtyDaysFromNow;
      }).length || 0;

      setStats({
        totalProducts,
        lowStockItems,
        expiringSoon,
        totalValue: 0, // Calculate based on product prices if available
      });

      // Prepare chart data
      const locationData = inventoryData?.reduce((acc: any[], item) => {
        const existing = acc.find(x => x.location === item.location.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          acc.push({
            location: item.location.name,
            quantity: item.quantity,
          });
        }
        return acc;
      }, []) || [];

      setChartData(locationData);
    }
    
    setLoading(false);
  };

  const categoryData = inventory.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.category === item.product.category);
    if (existing) {
      existing.value += item.quantity;
    } else {
      acc.push({
        category: item.product.category,
        value: item.quantity,
      });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-3 w-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Below 10 units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.length}</div>
            <p className="text-xs text-muted-foreground">
              Active warehouses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Low Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventory
              .filter(item => item.quantity < 10)
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">{item.location.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">{item.quantity} units</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(item.expiration_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryOverview;