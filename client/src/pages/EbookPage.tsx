import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import EbookDownload from '@/components/EbookDownload';
import { PageContent } from '@/lib/types';

export default function EbookPage() {
  const { data: ebookContent, isLoading } = useQuery<PageContent>({
    queryKey: ['/api/page-contents/ebook-section'],
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Domain Name Guide</h1>
            <p className="text-xl text-gray-600">
              Download our free guide to learn effective domain name strategies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="prose max-w-none">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">What's Inside Our Free Guide</h2>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>How to effectively manage your domain names</li>
                      <li>Understanding domain name value factors</li>
                      <li>Strategies for selling domains at premium prices</li>
                      <li>Tips for domain name buyers and sellers</li>
                      <li>Making money with domain parking services</li>
                      <li>Proven tactics for domain name investments</li>
                    </ul>
                    
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Why Download This Guide?</h3>
                      <p>This comprehensive 30+ page guide contains expert knowledge on how to manage and profit from domain names. Whether you're a beginner or experienced domain investor, you'll find valuable insights to maximize your success in the domain industry.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="sticky top-8">
                <EbookDownload
                  pageKey="ebook-section"
                  title="Domain Name Guide"
                  description="Get immediate access to our comprehensive guide"
                  price={0} // Free ebook
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}