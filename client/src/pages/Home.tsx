import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DomainListing from "@/components/DomainListing";
import Features from "@/components/Features";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import OfferModal from "@/components/OfferModal";
import { Domain } from "@/lib/types";

export default function Home() {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const handleMakeOffer = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsOfferModalOpen(true);
  };

  const handleCloseOfferModal = () => {
    setIsOfferModalOpen(false);
    setSelectedDomain(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <DomainListing onMakeOffer={handleMakeOffer} />
      <Features />
      <Reviews />
      <Footer />
      <OfferModal 
        isOpen={isOfferModalOpen}
        onClose={handleCloseOfferModal}
        domain={selectedDomain}
      />
    </div>
  );
}
