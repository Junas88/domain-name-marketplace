import { Star, Quote } from "lucide-react";

// Reviews data
const reviews = [
  {
    id: 1,
    name: "Alex Johnson",
    company: "TechStartup Inc",
    rating: 5,
    text: "Found the perfect domain for our tech startup through TakeMyName. The process was smooth and the consultation service was invaluable.",
    avatar: "AJ",
    date: "April 2, 2025"
  },
  {
    id: 2,
    name: "Sarah Williams",
    company: "Creative Solutions",
    rating: 5,
    text: "As a branding agency, we've used many domain services, but TakeMyName stands out for their curated selection and responsive support.",
    avatar: "SW",
    date: "March 27, 2025"
  },
  {
    id: 3,
    name: "Michael Chen",
    company: "Innovate Labs",
    rating: 4,
    text: "Quick and efficient service. I was able to secure a premium domain name that perfectly matches our brand identity.",
    avatar: "MC",
    date: "March 15, 2025"
  },
  {
    id: 4,
    name: "Jessica Rodriguez",
    company: "Bloom E-commerce",
    rating: 5,
    text: "The domain finder service saved us countless hours of searching. Their team understood exactly what we needed.",
    avatar: "JR",
    date: "February 28, 2025"
  },
  {
    id: 5,
    name: "David Thompson",
    company: "Financial Advisors Group",
    rating: 5,
    text: "Professional service from start to finish. The domain we acquired has already improved our online credibility significantly.",
    avatar: "DT",
    date: "February 20, 2025"
  },
  {
    id: 6,
    name: "Emma Wilson",
    company: "Health & Wellness Co",
    rating: 4,
    text: "TakeMyName helped us find a domain that perfectly captures our brand essence. Their expertise was evident throughout the process.",
    avatar: "EW",
    date: "February 12, 2025"
  },
  {
    id: 7,
    name: "James Lee",
    company: "Digital Media Agency",
    rating: 5,
    text: "As someone who works in digital marketing, I appreciate the quality of domains available. Found exactly what I was looking for.",
    avatar: "JL",
    date: "January 30, 2025"
  },
  {
    id: 8,
    name: "Olivia Garcia",
    company: "Boutique Retail",
    rating: 5,
    text: "The consultation service was worth every penny. Our new domain perfectly represents our brand and is easy for customers to remember.",
    avatar: "OG",
    date: "January 18, 2025"
  },
  {
    id: 9,
    name: "Robert Kim",
    company: "Tech Education Platform",
    rating: 4,
    text: "Responsive service and great selection of premium domains. Very satisfied with our purchase and the overall experience.",
    avatar: "RK",
    date: "January 7, 2025"
  },
  {
    id: 10,
    name: "Sophia Martinez",
    company: "Travel Experiences",
    rating: 5,
    text: "We needed a catchy, memorable domain for our travel business, and TakeMyName delivered beyond our expectations.",
    avatar: "SM",
    date: "December 22, 2024"
  },
  {
    id: 11,
    name: "Daniel Jackson",
    company: "Software Solutions",
    rating: 5,
    text: "The negotiation process for our premium domain was handled professionally. Very pleased with the outcome and support received.",
    avatar: "DJ",
    date: "December 15, 2024"
  },
  {
    id: 12,
    name: "Ava Patel",
    company: "Community Marketplace",
    rating: 4,
    text: "TakeMyName helped us secure a domain that perfectly aligns with our brand vision. Their expertise and guidance were invaluable.",
    avatar: "AP",
    date: "December 3, 2024"
  }
];

export default function Reviews() {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <section className="py-16 bg-white border-t border-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-center mb-12">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 border border-black flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold mr-4">
                  {review.avatar}
                </div>
                <div>
                  <h3 className="font-semibold">{review.name}</h3>
                  <p className="text-sm text-gray-600">{review.company}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {renderStars(review.rating)}
              </div>
              
              <div className="flex-grow">
                <div className="relative">
                  <Quote className="h-6 w-6 text-gray-300 absolute -left-2 -top-2 opacity-50" />
                  <p className="text-neutral-700 relative z-10 pl-4">{review.text}</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                {review.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}