import { useEffect } from "react";
import Hero from "@/components/Hero";
import DashboardShowcase from "@/components/DashboardShowcase";
import Features from "@/components/Features";
import ExchangeLogos from "@/components/ExchangeLogos";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { MobileHeader } from "@/components/MobileHeader";
import { ProofBar } from "@/components/ProofBar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Helmet } from 'react-helmet-async';
import { HreflangLinks } from '@/components/HreflangLinks';
import { landingMeta, getLandingStructuredData, trackLandingView, trackCTAClick } from '@/utils/i18nLandingMeta';
import { SUPPORTED_LANGUAGES } from "@/utils/languageRouting";

const IndexVi = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const meta = landingMeta['vi'];

  useEffect(() => {
    // Track landing view
    trackLandingView('vi');
  }, []);

  const handleCTAClick = (location: string) => {
    trackCTAClick('vi', location);
    navigate('/auth?lang=vi');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <HreflangLinks languages={[...SUPPORTED_LANGUAGES]} defaultLanguage="en" />
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="keywords" content={meta.keywords} />
        <link rel="canonical" href={meta.canonical} />

        <meta property="og:title" content={meta.ogTitle} />
        <meta property="og:description" content={meta.ogDescription} />
        <meta property="og:image" content={meta.ogImage} />
        <meta property="og:url" content={meta.canonical} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.ogTitle} />
        <meta name="twitter:description" content={meta.ogDescription} />
        <meta name="twitter:image" content={meta.ogImage} />

        <script type="application/ld+json">
          {JSON.stringify(getLandingStructuredData('vi'))}
        </script>
      </Helmet>
      <MobileHeader />

      <main className="pt-14">
        <Hero />
        <ProofBar />
        <DashboardShowcase />
        <Features />
        <ExchangeLogos />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>

      <Footer />
    </div>
  );
};

export default IndexVi;
