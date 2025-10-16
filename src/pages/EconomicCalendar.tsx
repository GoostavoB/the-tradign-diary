import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EconomicCalendar = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Economic Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with important economic events and indicators
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Real-Time Economic Events</CardTitle>
            <CardDescription>
              High-impact economic events that may affect market movements
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full">
              <div className="mx-auto w-full max-w-[1100px] p-6">
                <div className="overflow-x-auto rounded-lg border border-border bg-background">
                  <div className="min-w-[980px] mx-auto">
                    <iframe 
                      src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&countries=5&calType=week&timeZone=8&lang=1" 
                      width="980" 
                      height="620" 
                      frameBorder="0" 
                      allowTransparency={true}
                      className="block"
                    />
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Real Time Economic Calendar provided by{' '}
                  <a 
                    href="https://www.investing.com/" 
                    rel="nofollow" 
                    target="_blank" 
                    className="text-primary font-semibold hover:underline"
                  >
                    Investing.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EconomicCalendar;
