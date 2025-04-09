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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Domain Investment Ebook</h1>
            <p className="text-xl text-gray-600">
              Learn the secrets of successful domain investment from experts in the industry
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
                ) : ebookContent ? (
                  <div dangerouslySetInnerHTML={{ __html: ebookContent.content }} />
                ) : (
                  <p>No content available. Please check back later.</p>
                )}
              </div>
            </div>
            
            <div>
              <div className="sticky top-8">
                {ebookContent && (
                  <EbookDownload
                    pageKey="ebook-section"
                    title="Domain Investment Guide"
                    description="Get immediate access to our comprehensive guide"
                    price={ebookContent.price || 1999} // Default price if not set
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}