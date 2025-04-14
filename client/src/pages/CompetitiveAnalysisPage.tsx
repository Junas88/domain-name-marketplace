import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompetitiveAnalysisTool from "@/components/CompetitiveAnalysisTool";

export default function DomainCompetitiveAnalysisPage() {
  // Set up meta tags for this page
  useEffect(() => {
    // Page title
    document.title = "Domain Competitive Analysis | Compare Domains";
    
    // Update meta description
    const description = "Compare your domain to similar domains that have recently sold in terms of length, keywords, and potential value with our Competitive Analysis Tool.";
    
    // Helper function to update meta tags
    const updateMetaTag = (name: string, content: string) => {
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
    
    // Update all meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', 'domain comparison, competitive analysis, domain value, similar domains, domain market, domain length, domain keywords');
    
    // Open Graph meta tags
    updateMetaTag('og:title', document.title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    
    // Twitter card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', document.title);
    updateMetaTag('twitter:description', description);
    
    // Update canonical URL
    const canonicalUrl = `${window.location.origin}/domain-value-calculator`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalLink);
    }
    
    // Clean up when component unmounts
    return () => {
      // Nothing to clean up here as these tags should persist
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-black text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Domain Competitive Analysis</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Compare your domain to similar domains that have recently sold in the marketplace
            </p>
          </div>
        </div>
        
        <CompetitiveAnalysisTool />
      </main>
      
      <Footer />
    </div>
  );
}