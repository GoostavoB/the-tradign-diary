import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getLocalizedPath, isPublicRoute } from '@/utils/languageRouting';

export const PublicHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useTranslation();

  const isPublic = isPublicRoute(location.pathname);

  const handleNavigate = (path: string) => {
    const localizedPath = isPublic ? getLocalizedPath(path, language) : path;
    navigate(localizedPath);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop & Mobile Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between px-4 py-4">
            {/* Logo - visible on all devices */}
            <Link 
              to={isPublic ? getLocalizedPath('/', language) : '/'}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo-512.png" 
                alt="The Trading Diary Logo" 
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <span className="text-lg md:text-xl font-bold text-white">
                The Trading Diary
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => handleNavigate('/pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('navigation.pricing', 'Pricing')}
              </button>
              <button
                onClick={() => handleNavigate('/features')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('navigation.features', 'Features')}
              </button>
              <button
                onClick={() => handleNavigate('/how-it-works')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('navigation.howItWorks', 'How it Works')}
              </button>
              <button
                onClick={() => handleNavigate('/blog')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('navigation.blog', 'Blog')}
              </button>
              <button
                onClick={() => handleNavigate('/contact')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('navigation.contact', 'Contact')}
              </button>
              
              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={() => handleNavigate('/auth')}
                  className="px-4 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('navigation.signIn', 'Sign In')}
                </button>
                <button
                  onClick={() => handleNavigate('/auth')}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                >
                  {t('navigation.getStarted', 'Get Started')}
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-80 bg-gray-900 z-50 overflow-y-auto shadow-xl lg:hidden">
            <div className="p-6 space-y-6">
              <nav className="space-y-2">
                <button
                  onClick={() => handleNavigate('/pricing')}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('navigation.pricing', 'Pricing')}
                </button>

                <button
                  onClick={() => handleNavigate('/features')}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('navigation.features', 'Features')}
                </button>

                <button
                  onClick={() => handleNavigate('/how-it-works')}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('navigation.howItWorks', 'How it Works')}
                </button>

                <button
                  onClick={() => handleNavigate('/blog')}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('navigation.blog', 'Blog')}
                </button>

                <button
                  onClick={() => handleNavigate('/contact')}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('navigation.contact', 'Contact')}
                </button>

                <button
                  onClick={() => handleNavigate('/testimonials')}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t('navigation.testimonials', 'Testimonials')}
                </button>
              </nav>

              <div className="border-t border-gray-800" />

              <div className="space-y-3">
                <button
                  onClick={() => handleNavigate('/auth')}
                  className="w-full px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors text-center"
                >
                  {t('navigation.signIn', 'Sign In')}
                </button>

                <button
                  onClick={() => handleNavigate('/auth')}
                  className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-center font-medium"
                >
                  {t('navigation.getStarted', 'Get Started')}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800 space-y-2">
                <button
                  onClick={() => handleNavigate('/about')}
                  className="w-full text-left px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {t('navigation.about', 'About')}
                </button>

                <button
                  onClick={() => handleNavigate('/privacy')}
                  className="w-full text-left px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {t('navigation.privacy', 'Privacy Policy')}
                </button>

                <button
                  onClick={() => handleNavigate('/terms')}
                  className="w-full text-left px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {t('navigation.terms', 'Terms of Service')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
