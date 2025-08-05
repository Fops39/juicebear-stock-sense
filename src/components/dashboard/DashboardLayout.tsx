import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Warehouse, 
  ShoppingCart, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  LogOut,
  Bell,
  Settings
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import InventoryOverview from "./InventoryOverview";
import RestockRequests from "./RestockRequests";
import SalesTracking from "./SalesTracking";
import ExpirationAlerts from "./ExpirationAlerts";

interface DashboardLayoutProps {
  user: User;
  onSignOut: () => void;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'employee';
}

const DashboardLayout = ({ user, onSignOut }: DashboardLayoutProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchNotifications();
  }, [user]);

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setUserProfile(data);
    }
  };

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Juice Inventory</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {notifications.length}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Welcome, {userProfile?.first_name} {userProfile?.last_name}
              <Badge variant={isAdmin ? "default" : "secondary"} className="ml-2">
                {userProfile?.role}
              </Badge>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <InventoryOverview isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="inventory">
            <RestockRequests isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="sales">
            <SalesTracking isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="alerts">
            <ExpirationAlerts />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardLayout;