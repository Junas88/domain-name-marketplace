import { DOMAIN_CATEGORIES } from '../../../shared/schema';
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
  showTrending?: boolean;
}

export function CategoryBadge({ category, className, showTrending = true }: CategoryBadgeProps) {
  // Default to 'other' if the category doesn't exist
  const categoryInfo = DOMAIN_CATEGORIES[category] || DOMAIN_CATEGORIES['other'];
  
  // Get color from category info
  const backgroundColor = categoryInfo.color;
  const isTrending = showTrending && categoryInfo.isTrending;
  
  return (
    <Badge 
      className={`font-medium px-2.5 py-1 ${className}`}
      style={{ 
        backgroundColor, 
        color: '#ffffff',
        textShadow: '0px 0px 1px rgba(0,0,0,0.2)'
      }}
    >
      {isTrending && (
        <TrendingUp className="w-3.5 h-3.5 mr-1 inline-flex" />
      )}
      {categoryInfo.label}
    </Badge>
  );
}

// Component to display trending categories list
export function TrendingCategories() {
  // Filter to only get trending categories
  const trendingCategories = Object.entries(DOMAIN_CATEGORIES)
    .filter(([_, data]) => data.isTrending)
    .map(([key, data]) => ({
      id: key,
      ...data
    }));
  
  return (
    <div className="flex flex-wrap gap-2 my-4">
      <h3 className="text-lg font-semibold w-full mb-2">Trending Categories</h3>
      {trendingCategories.map(category => (
        <CategoryBadge key={category.id} category={category.id} />
      ))}
    </div>
  );
}

// Component to display category filters
export function CategoryFilters({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}) {
  // Group categories by trending status
  const trendingCategories = Object.entries(DOMAIN_CATEGORIES)
    .filter(([_, data]) => data.isTrending)
    .map(([key, data]) => ({
      id: key,
      ...data
    }));
    
  const otherCategories = Object.entries(DOMAIN_CATEGORIES)
    .filter(([_, data]) => !data.isTrending)
    .map(([key, data]) => ({
      id: key,
      ...data
    }));
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Trending Categories</h3>
        <div className="flex flex-wrap gap-2">
          {trendingCategories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
              className={`transition-all duration-200 ${selectedCategory === category.id ? 'ring-2 ring-offset-2 ring-black' : ''}`}
            >
              <CategoryBadge category={category.id} />
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">All Categories</h3>
        <div className="flex flex-wrap gap-2">
          {otherCategories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
              className={`transition-all duration-200 ${selectedCategory === category.id ? 'ring-2 ring-offset-2 ring-black' : ''}`}
            >
              <CategoryBadge category={category.id} showTrending={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}