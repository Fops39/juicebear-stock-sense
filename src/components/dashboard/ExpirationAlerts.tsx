import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Package, MapPin, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExpirationItem {
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
  daysUntilExpiration: number;
}

const ExpirationAlerts = () => {
  const [expiringItems, setExpiringItems] = useState<ExpirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const fetchExpiringItems = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*),
        location:locations(*)
      `)
      .order('expiration_date', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
    } else {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const itemsWithExpiration = (data || [])
        .map(item => {
          const expirationDate = new Date(item.expiration_date);
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...item,
            daysUntilExpiration,
          };
        })
        .filter(item => item.daysUntilExpiration <= 30)
        .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

      setExpiringItems(itemsWithExpiration);
    }
    
    setLoading(false);
  };

  const sendNotification = async (item: ExpirationItem) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Expiration Alert',
        message: `${item.product.name} at ${item.location.name} expires in ${item.daysUntilExpiration} days (${item.quantity} units)`,
        type: 'expiration_warning',
        read: false,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Notification Sent",
        description: "Expiration alert has been sent to administrators",
      });
    }
  };

  const getUrgencyBadge = (days: number) => {
    if (days < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (days <= 7) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (days <= 14) {
      return <Badge variant="destructive" className="bg-orange-500">Warning</Badge>;
    } else {
      return <Badge variant="secondary">Attention</Badge>;
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "border-red-500 bg-red-50";
    if (days <= 7) return "border-red-400 bg-red-50";
    if (days <= 14) return "border-orange-400 bg-orange-50";
    return "border-yellow-400 bg-yellow-50";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-1/2 bg-muted rounded"></div>
                <div className="h-3 w-1/3 bg-muted rounded"></div>
                <div className="h-3 w-1/4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const expiredItems = expiringItems.filter(item => item.daysUntilExpiration < 0);
  const criticalItems = expiringItems.filter(item => item.daysUntilExpiration >= 0 && item.daysUntilExpiration <= 7);
  const warningItems = expiringItems.filter(item => item.daysUntilExpiration > 7 && item.daysUntilExpiration <= 14);
  const attentionItems = expiringItems.filter(item => item.daysUntilExpiration > 14);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expiration Alerts</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          {expiringItems.length} items need attention
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredItems.length}</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>

        <Card className="border-red-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Critical (≤7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalItems.length}</div>
            <p className="text-xs text-muted-foreground">Expires within a week</p>
          </CardContent>
        </Card>

        <Card className="border-orange-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">Warning (≤14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{warningItems.length}</div>
            <p className="text-xs text-muted-foreground">Expires within 2 weeks</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Attention (≤30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{attentionItems.length}</div>
            <p className="text-xs text-muted-foreground">Expires within a month</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Items List */}
      <div className="space-y-4">
        {expiringItems.map((item) => (
          <Card key={item.id} className={`${getUrgencyColor(item.daysUntilExpiration)} border-l-4`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{item.product.name}</h3>
                    {getUrgencyBadge(item.daysUntilExpiration)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location.name} - {item.location.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {item.quantity} units
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expires: {new Date(item.expiration_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <Badge variant="outline" className="text-xs">
                      {item.product.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm font-medium">
                    {item.daysUntilExpiration < 0 
                      ? `Expired ${Math.abs(item.daysUntilExpiration)} days ago`
                      : item.daysUntilExpiration === 0
                      ? "Expires today"
                      : `Expires in ${item.daysUntilExpiration} day${item.daysUntilExpiration > 1 ? 's' : ''}`
                    }
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => sendNotification(item)}
                    className="flex items-center gap-1"
                  >
                    <Bell className="h-3 w-3" />
                    Alert Admin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {expiringItems.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Expiration Alerts</h3>
              <p className="text-muted-foreground">
                All inventory items are well within their expiration dates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExpirationAlerts;