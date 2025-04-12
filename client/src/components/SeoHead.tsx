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

    // Update title - critical for SEO
    document.title = seoSettings.title;

    // Update essential meta tags for Google search ranking
    updateMetaTag('description', seoSettings.metaDescription);
    updateMetaTag('keywords', seoSettings.metaKeywords);
    
    // Update structured data for rich snippets in Google search results
    updateStructuredData(seoSettings.structuredData);

    // Set canonical URL - important for avoiding duplicate content issues
    updateCanonicalURL();

    return () => {
      // Clean up structured data when component unmounts
      const existingScript = document.getElementById('structured-data-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [seoSettings, location]);

  // Helper function to update meta tags
  const updateMetaTag = (name: string, content: string | null) => {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    
    if (metaTag) {
      metaTag.setAttribute('content', content);
    } else {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
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