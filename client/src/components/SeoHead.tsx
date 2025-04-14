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

    // Update title - critical for SEO (keep it under 60 characters for optimal display)
    document.title = seoSettings.title;

    // Update essential meta tags for Google search ranking
    updateMetaTag('description', seoSettings.metaDescription);
    updateMetaTag('keywords', seoSettings.metaKeywords);
    
    // Open Graph meta tags for better social media sharing
    updateMetaTag('og:title', seoSettings.title);
    updateMetaTag('og:description', seoSettings.metaDescription);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    
    // Twitter card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoSettings.title);
    updateMetaTag('twitter:description', seoSettings.metaDescription);
    
    // Mobile optimization meta tags
    updateMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5');

    // Enhanced semantic tags
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('author', 'Domain Name Guide');
    
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
    
    // Handle OpenGraph and Twitter tags which use 'property' instead of 'name'
    const isPropertyTag = name.startsWith('og:') || name.startsWith('twitter:');
    const attrName = isPropertyTag ? 'property' : 'name';
    
    // Check for existing tag with the correct attribute
    let metaTag = document.querySelector(`meta[${attrName}="${name}"]`);
    
    if (metaTag) {
      metaTag.setAttribute('content', content);
    } else {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attrName, name);
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