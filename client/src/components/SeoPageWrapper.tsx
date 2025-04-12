import { ReactNode } from 'react';
import SeoHead from './SeoHead';

interface SeoPageWrapperProps {
  pageKey: string;
  children: ReactNode;
}

export default function SeoPageWrapper({ pageKey, children }: SeoPageWrapperProps) {
  return (
    <>
      <SeoHead pageKey={pageKey} />
      {children}
    </>
  );
}