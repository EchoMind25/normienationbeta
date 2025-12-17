import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Shield,
  AlertTriangle,
  Activity,
  Settings,
  Plus,
  Trash2,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface ManualDevBuy {
  id: string;
  timestamp: string;
  amount: string;
  price: string;
  label: string | null;
  createdAt: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const [timestamp, setTimestamp] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [label, setLabel] = useState("");

  const { data: manualDevBuys = [], isLoading: loadingBuys } = useQuery<ManualDevBuy[]>({
    queryKey: ["/api/admin/dev-buys"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const addDevBuyMutation = useMutation({
    mutationFn: async (data: {
      timestamp: string;
      amount: number;
      price: number;
      label?: string;
    }) => {
      const res = await apiRequest("POST", "/api/admin/dev-buys", data);
      if (!res.ok) throw new Error("Failed to add dev buy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dev-buys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dev-buys"] });
      toast({ title: "Dev buy added", description: "The chart marker has been added" });
      setTimestamp("");
      setAmount("");
      setPrice("");
      setLabel("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add dev buy", variant: "destructive" });
    },
  });

  const deleteDevBuyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/dev-buys/${id}`);
      if (!res.ok) throw new Error("Failed to delete dev buy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dev-buys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dev-buys"] });
      toast({ title: "Dev buy removed", description: "The chart marker has been removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete dev buy", variant: "destructive" });
    },
  });

  const handleAddDevBuy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timestamp || !amount || !price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    addDevBuyMutation.mutate({
      timestamp: new Date(timestamp).toISOString(),
      amount: parseFloat(amount),
      price: parseFloat(price),
      label: label || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground font-mono">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage users and monitor platform activity
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">--</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">--</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manual Dev Buys</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{manualDevBuys.length}</div>
              <p className="text-xs text-muted-foreground">Chart markers added</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Dev Buy Chart Markers
            </CardTitle>
            <CardDescription>
              Manually add dev buy markers to display on the price chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDevBuy} className="space-y-4 mb-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="timestamp">Date/Time *</Label>
                  <Input
                    id="timestamp"
                    type="datetime-local"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    data-testid="input-dev-buy-timestamp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (tokens) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    placeholder="100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="input-dev-buy-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.0000000001"
                    placeholder="0.0004"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    data-testid="input-dev-buy-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label (optional)</Label>
                  <Input
                    id="label"
                    type="text"
                    placeholder="Dev buy #1"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    data-testid="input-dev-buy-label"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={addDevBuyMutation.isPending}
                data-testid="button-add-dev-buy"
              >
                <Plus className="h-4 w-4 mr-2" />
                {addDevBuyMutation.isPending ? "Adding..." : "Add Dev Buy Marker"}
              </Button>
            </form>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Existing Manual Dev Buys
              </h4>
              {loadingBuys ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : manualDevBuys.length === 0 ? (
                <p className="text-muted-foreground text-sm">No manual dev buys added yet</p>
              ) : (
                <div className="space-y-2">
                  {manualDevBuys.map((buy) => (
                    <div
                      key={buy.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                      data-testid={`dev-buy-${buy.id}`}
                    >
                      <div className="flex-1 flex flex-wrap items-center gap-4">
                        <div>
                          <span className="text-sm font-medium">
                            {new Date(buy.timestamp).toLocaleString()}
                          </span>
                          {buy.label && (
                            <Badge variant="outline" className="ml-2">
                              {buy.label}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {parseFloat(buy.amount).toLocaleString()} tokens @ $
                          {parseFloat(buy.price).toFixed(8)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteDevBuyMutation.mutate(buy.id)}
                        disabled={deleteDevBuyMutation.isPending}
                        data-testid={`button-delete-dev-buy-${buy.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Features
            </CardTitle>
            <CardDescription>Platform management tools and moderation capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-muted-foreground">
                    View, edit, and moderate user accounts
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Content Moderation</h3>
                  <p className="text-sm text-muted-foreground">Review reported content and memes</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">NFT Marketplace</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage NFT listings and transactions
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    View platform statistics and metrics
                  </p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
