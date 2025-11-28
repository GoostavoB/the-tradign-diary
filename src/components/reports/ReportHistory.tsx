import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  type: string;
  format: string;
  dateGenerated: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  size: string;
}

export function ReportHistory() {
  const { user } = useAuth();
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(report => ({
        id: report.id,
        name: report.report_name,
        type: report.report_type,
        format: report.report_format,
        dateGenerated: new Date(report.created_at),
        dateRange: {
          start: new Date((report.date_range as any)?.start || new Date()),
          end: new Date((report.date_range as any)?.end || new Date()),
        },
        size: report.file_size || 'N/A',
      })) as Report[];
    },
    enabled: !!user,
  });

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to delete report');
      return;
    }

    toast.success('Report deleted successfully');
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case "excel":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "json":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      default:
        return "";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "monthly":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "quarterly":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      case "yearly":
        return "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20";
      default:
        return "";
    }
  };

  return (
    <PremiumCard>
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold">Report History</h3>
        <p className="text-sm text-muted-foreground">Previously generated trading reports</p>
      </div>
      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports && reports.length > 0 ? reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{report.name}</h4>
                      <Badge className={getTypeBadgeColor(report.type)}>
                        {report.type}
                      </Badge>
                      <Badge className={getFormatBadgeColor(report.format)}>
                        {report.format.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(report.dateRange.start, "MMM d")} - {format(report.dateRange.end, "MMM d, yyyy")}
                      </div>
                      <span>Generated: {format(report.dateGenerated, "MMM d, yyyy")}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Generate your first report to see it here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}
