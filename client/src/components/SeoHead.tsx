import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SeoSettings } from '@/lib/types';
import { useLocation } from 'wouter';

interface SeoHeadProps {
  pageKey: string;
}

export default function SeoHead({ pageKey }: SeoHeadProps) {
  const [location] = useLocation();
  const { data: seoSettings } = useQuery<SeoSettings>({
    queryKey: [`/api/seo-settings/${pageKey}`],
    enabled: !!pageKey,
  });

  useEffect(() => {
    if (!seoSettings) return;

    // Update title
    document.title = seoSettings.title;

    // Update meta tags
    updateMetaTag('description', seoSettings.metaDescription);
    updateMetaTag('keywords', seoSettings.metaKeywords);
    
    // Update Open Graph tags
    if (seoSettings.ogTitle) updateMetaTag('og:title', seoSettings.ogTitle, 'property');
    if (seoSettings.ogDescription) updateMetaTag('og:description', seoSettings.ogDescription, 'property');
    if (seoSettings.ogImage) updateMetaTag('og:image', seoSettings.ogImage, 'property');
    
    // Update Twitter tags
    if (seoSettings.twitterTitle) updateMetaTag('twitter:title', seoSettings.twitterTitle, 'property');
    if (seoSettings.twitterDescription) updateMetaTag('twitter:description', seoSettings.twitterDescription, 'property');
    if (seoSettings.twitterImage) updateMetaTag('twitter:image', seoSettings.twitterImage, 'property');

    // Update JSON-LD structured data
    updateStructuredData(seoSettings.structuredData);

    // Set canonical URL
    updateCanonicalURL();

    return () => {
      // Clean up JSON-LD when component unmounts
      const existingScript = document.getElementById('structured-data-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [seoSettings, location]);

  // Helper function to update meta tags
  const updateMetaTag = (name: string, content: string | null, nameAttr: 'name' | 'property' = 'name') => {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[${nameAttr}="${name}"]`);
    
    if (metaTag) {
      metaTag.setAttribute('content', content);
    } else {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(nameAttr, name);
      metaTag.setAttribute('content', content);
      document.head.appendChild(metaTag);
    }
  };

  // Helper function to update JSON-LD structured data
  const updateStructuredData = (structuredData: string | null) => {
    if (!structuredData) return;
    
    // Remove existing structured data script if any
    const existingScript = document.getElementById('structured-data-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    try {
      // Create and append new structured data script
      const script = document.createElement('script');
      script.id = 'structured-data-script';
      script.type = 'application/ld+json';
      script.textContent = structuredData;
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error adding structured data:', error);
    }
  };

  // Helper function to update canonical URL
  const updateCanonicalURL = () => {
    const baseUrl = window.location.origin;
    const canonicalPath = location === '/' ? '' : location;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalLink);
    }
  };

  // This component doesn't render anything visually
  return null;
}