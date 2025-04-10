import { useQuery } from "@tanstack/react-query";

export default function Hero() {
  return (
    <section className="bg-white text-black py-16" aria-labelledby="hero-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Perfect Domain Name
          </h1>
          <p className="text-xl mb-8">
            Premium domains with instant Buy-It-Now prices or make an offer. Secure the ideal domain for your startup, business, brand, or project.
          </p>
          
          {/* SEO Keywords in hidden span for search engines */}
          <span className="sr-only">
            DOMAIN NAME GUIDE, domain marketplace, premium domains, buy domains, sell domains, domain broker, domain consultation, business domains, tech domains
          </span>
        </div>
      </div>
    </section>
  );
}
