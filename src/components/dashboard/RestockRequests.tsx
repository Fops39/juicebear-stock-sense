import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, X, Package, Calendar } from "lucide-react";

interface RestockRequestsProps {
  isAdmin: boolean;
}

interface RestockRequest {
  id: string;
  product: {
    name: string;
    category: string;
  };
  location: {
    name: string;
    type: string;
  };
  requested_quantity: number;
  confirmed_quantity: number | null;
  status: 'pending' | 'approved' | 'rejected';
  employee: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

const RestockRequests = ({ isAdmin }: RestockRequestsProps) => {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    product_id: '',
    location_id: '',
    requested_quantity: '',
    expiration_date: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch restock requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('restock_requests')
      .select(`
        *,
        product:products(*),
        location:locations(*),
        employee:profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
    } else {
      setRequests(requestsData || []);
    }

    // Fetch products and locations for the form
    const [{ data: productsData }, { data: locationsData }] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('locations').select('*')
    ]);

    setProducts(productsData || []);
    setLocations(locationsData || []);
    setLoading(false);
  };

  const createRestockRequest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from('restock_requests')
      .insert({
        product_id: newRequest.product_id,
        location_id: newRequest.location_id,
        requested_quantity: parseInt(newRequest.requested_quantity),
        employee_id: user.id,
        status: 'pending',
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create restock request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Restock request created successfully",
      });
      setShowCreateDialog(false);
      setNewRequest({
        product_id: '',
        location_id: '',
        requested_quantity: '',
        expiration_date: '',
      });
      fetchData();
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected', confirmedQuantity?: number) => {
    const updateData: any = { status };
    if (status === 'approved' && confirmedQuantity) {
      updateData.confirmed_quantity = confirmedQuantity;
    }

    const { error } = await supabase
      .from('restock_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Request ${status} successfully`,
      });
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restock Requests</h2>
        {!isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Restock Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={newRequest.product_id} onValueChange={(value) => setNewRequest({...newRequest, product_id: value})}>
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
                  <Select value={newRequest.location_id} onValueChange={(value) => setNewRequest({...newRequest, location_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Requested Quantity</Label>
                  <Input
                    type="number"
                    value={newRequest.requested_quantity}
                    onChange={(e) => setNewRequest({...newRequest, requested_quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />
                </div>
                
                <Button onClick={createRestockRequest} className="w-full">
                  Create Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{request.product.name}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {request.location.name} - {request.location.type}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span>Requested: <strong>{request.requested_quantity} units</strong></span>
                    {request.confirmed_quantity && (
                      <span>Confirmed: <strong>{request.confirmed_quantity} units</strong></span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(request.created_at).toLocaleDateString()}
                    <span>by {request.employee.first_name} {request.employee.last_name}</span>
                  </div>
                </div>

                {isAdmin && request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="default">
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Restock Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Confirm the exact quantity to be restocked:</p>
                          <div className="space-y-2">
                            <Label>Confirmed Quantity</Label>
                            <Input
                              type="number"
                              placeholder={request.requested_quantity.toString()}
                              id={`confirm-${request.id}`}
                            />
                          </div>
                          <Button 
                            onClick={() => {
                              const input = document.getElementById(`confirm-${request.id}`) as HTMLInputElement;
                              const quantity = parseInt(input.value) || request.requested_quantity;
                              updateRequestStatus(request.id, 'approved', quantity);
                            }}
                            className="w-full"
                          >
                            Confirm Approval
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RestockRequests;