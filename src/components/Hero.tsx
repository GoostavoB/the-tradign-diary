import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bullBearRealistic from "@/assets/bull-bear-realistic.png";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Subtle */}
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src={bullBearRealistic} 
          alt="Trading background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[180px] animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="hidden md:flex justify-center mb-8 gap-6">
          <div className="p-4 glass-subtle rounded-xl hover-lift">
            <TrendingUp className="text-primary" size={40} />
          </div>
          <div className="p-4 glass-subtle rounded-xl hover-lift">
            <BarChart3 className="text-primary" size={40} />
          </div>
          <div className="p-4 glass-subtle rounded-xl hover-lift">
            <LineChart className="text-primary" size={40} />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight leading-tight">
          <span className="text-gradient-primary">
            The Trading Diary
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl font-medium mb-4">
          Upload your trade. Track your performance.
        </p>
        
        <p className="text-base md:text-lg mb-12 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The premium trading journal built for serious traders who demand precision, 
          clarity, and the competitive edge to consistently outperform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-10 py-7 bg-foreground text-background hover:bg-foreground/90 font-semibold hover-lift"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/auth')}
            className="text-lg px-10 py-7 glass-subtle border-border/50 hover:border-primary/50 hover-lift"
          >
            Try for Free
          </Button>
        </div>

        {/* Stats - Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass-subtle p-8 rounded-2xl hover-lift">
            <div className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
              10K+
            </div>
            <div className="text-sm md:text-base text-muted-foreground">Active Traders</div>
          </div>
          <div className="glass-subtle p-8 rounded-2xl hover-lift">
            <div className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
              2M+
            </div>
            <div className="text-sm md:text-base text-muted-foreground">Trades Logged</div>
          </div>
          <div className="glass-subtle p-8 rounded-2xl hover-lift">
            <div className="text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
              98%
            </div>
            <div className="text-sm md:text-base text-muted-foreground">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
