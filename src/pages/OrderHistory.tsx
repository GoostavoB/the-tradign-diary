import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ShoppingBag, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Order {
  id: string;
  stripe_session_id: string;
  stripe_invoice_id: string | null;
  stripe_invoice_pdf: string | null;
  amount_total: number;
  currency: string;
  customer_email: string;
  customer_name: string | null;
  payment_status: string;
  product_type: string;
  product_name: string | null;
  quantity: number;
  created_at: string;
}

export default function OrderHistory() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case 'unpaid':
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      case 'failed':
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProductTypeColor = (type: string) => {
    if (type.includes('subscription')) {
      return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
    }
    return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
  };

  const handleDownloadInvoice = async (order: Order) => {
    if (order.stripe_invoice_pdf) {
      window.open(order.stripe_invoice_pdf, '_blank');
    } else {
      toast.error('Invoice not available for this order');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please sign in to view your order history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order History</h1>
        <p className="text-muted-foreground">View and manage your past purchases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>All your purchases and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold">
                          {order.product_name || 'Purchase'}
                        </h4>
                        <Badge className={getStatusColor(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                        <Badge className={getProductTypeColor(order.product_type)}>
                          {order.product_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {formatAmount(order.amount_total, order.currency)}
                        </div>
                        {order.customer_email && (
                          <span>{order.customer_email}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.stripe_invoice_pdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://dashboard.stripe.com/payments/${order.stripe_session_id}`, '_blank')}
                      disabled
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your purchase history will appear here
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Start Shopping
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
