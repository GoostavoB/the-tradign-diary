import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface HreflangLinksProps {
    baseUrl?: string;
    languages: string[];
    defaultLanguage?: string;
}

export const HreflangLinks = ({
    baseUrl = 'https://www.thetradingdiary.com',
    languages,
    defaultLanguage = 'en'
}: HreflangLinksProps) => {
    const location = useLocation();

    // Get current path without language prefix
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0];
    const isLangPath = languages.includes(firstPart);

    const basePath = isLangPath
        ? '/' + pathParts.slice(1).join('/')
        : location.pathname;

    // Determine current language for canonical
    const currentLang = isLangPath ? firstPart : defaultLanguage;
    const canonicalUrl = currentLang === defaultLanguage
        ? `${baseUrl}${basePath}`
        : `${baseUrl}/${currentLang}${basePath}`;

    return (
        <Helmet>
            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Hreflang Tags */}
            {languages.map(lang => {
                const href = lang === defaultLanguage
                    ? `${baseUrl}${basePath}`
                    : `${baseUrl}/${lang}${basePath}`;

                return <link key={lang} rel="alternate" hrefLang={lang} href={href} />;
            })}

            {/* x-default Hreflang */}
            <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${basePath}`} />
        </Helmet>
    );
};
