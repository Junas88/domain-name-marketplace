import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DomainValueCalculator from "@/components/DomainValueCalculator";
import SeoHead from "@/components/SeoHead";

export default function DomainValueCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead
        title="Domain Value Calculator | Estimate Domain Worth"
        description="Our interactive domain value calculator helps you estimate the market value of any domain name based on TLD, keywords, length, and other factors."
      />
      <Header />
      
      <main className="flex-grow">
        <div className="bg-black text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Domain Value Calculator</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover what factors influence domain value and get an instant estimate for any domain name
            </p>
          </div>
        </div>
        
        <DomainValueCalculator />
      </main>
      
      <Footer />
    </div>
  );
}