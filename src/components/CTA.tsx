import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-12 md:p-20">
          {/* Subtle Glow Effects */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to <span className="text-gradient-primary">Level Up</span><br />
              Your Trading?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of traders who are already using The Trading Diary to track, 
              analyze, and improve their trading performance.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-10 py-7 gradient-primary text-background hover:opacity-90 font-semibold group hover-lift"
            >
              <span className="flex items-center">
                Get Started Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">
              Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
