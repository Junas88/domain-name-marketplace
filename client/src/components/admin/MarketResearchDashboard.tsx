import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Newspaper, TrendingUp, BarChart, PieChart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title 
} from 'chart.js';
import { Line, Bar, Radar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Utility function for generating random colors
const generateColors = (count: number) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137) % 360; // Use golden ratio to spread colors evenly
    colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
  }
  return colors;
};

const MarketResearchDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('news');
  const [domainsToAnalyze, setDomainsToAnalyze] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  // News Query
  const {
    data: newsData,
    isLoading: isNewsLoading,
    error: newsError,
    refetch: refetchNews
  } = useQuery({
    queryKey: ['/api/market-research/news'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: activeTab === 'news'
  });
  
  // Pricing Trends Query
  const {
    data: pricingData,
    isLoading: isPricingLoading,
    error: pricingError,
    refetch: refetchPricing
  } = useQuery({
    queryKey: ['/api/market-research/pricing-trends'],
    staleTime: 1000 * 60 * 60, // 60 minutes
    enabled: activeTab === 'pricing'
  });
  
  // Market Demand Query
  const {
    data: demandData,
    isLoading: isDemandLoading,
    error: demandError,
    refetch: refetchDemand
  } = useQuery({
    queryKey: ['/api/market-research/market-demand'],
    staleTime: 1000 * 60 * 60, // 60 minutes
    enabled: activeTab === 'demand'
  });
  
  // Benchmarks Query
  const {
    data: benchmarkData,
    isLoading: isBenchmarkLoading,
    error: benchmarkError,
    refetch: refetchBenchmarks
  } = useQuery({
    queryKey: ['/api/market-research/benchmarks'],
    staleTime: 1000 * 60 * 60, // 60 minutes
    enabled: activeTab === 'benchmarks'
  });
  
  // Handle domain analysis
  const handleAnalyzeDomains = async () => {
    if (!domainsToAnalyze.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one domain name",
        variant: "destructive"
      });
      return;
    }
    
    const domainList = domainsToAnalyze.split(/[,\s]+/).filter(Boolean);
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/market-research/analyze-domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainNames: domainList }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze domains');
      }
      
      const data = await response.json();
      setAnalysisResults(data);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${domainList.length} domain${domainList.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Error analyzing domains:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Refresh data handlers
  const handleRefresh = () => {
    switch (activeTab) {
      case 'news':
        refetchNews();
        break;
      case 'pricing':
        refetchPricing();
        break;
      case 'demand':
        refetchDemand();
        break;
      case 'benchmarks':
        refetchBenchmarks();
        break;
      case 'analyze':
        setAnalysisResults(null);
        setDomainsToAnalyze('');
        break;
    }
    
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest market research data...",
    });
  };
  
  // Render Domain Industry News
  const renderNews = () => {
    if (isNewsLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    if (newsError) {
      return (
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error Loading News</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error fetching the latest domain industry news.</p>
            <Button onClick={() => refetchNews()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!newsData || !newsData.news || !Array.isArray(newsData.news)) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No News Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No recent domain industry news is available at this time.</p>
            <Button onClick={() => refetchNews()} variant="outline" className="mt-4">
              Refresh News
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {newsData.news.map((item: any, index: number) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant={item.impact > 7 ? "destructive" : item.impact > 4 ? "default" : "outline"}>
                  Impact: {item.impact}/10
                </Badge>
              </div>
              <CardDescription className="flex justify-between">
                <span>{item.source}</span>
                <span>{item.date}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{item.summary}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {item.domain_categories && Array.isArray(item.domain_categories) && 
                  item.domain_categories.map((category: string, i: number) => (
                    <Badge variant="secondary" key={i}>{category}</Badge>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render Pricing Trends
  const renderPricingTrends = () => {
    if (isPricingLoading) {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent className="h-64">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (pricingError) {
      return (
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error Loading Pricing Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error fetching the pricing trend analysis.</p>
            <Button onClick={() => refetchPricing()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!pricingData || !pricingData.categoryComparison) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Pricing Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No pricing trend data is available at this time.</p>
            <Button onClick={() => refetchPricing()} variant="outline" className="mt-4">
              Refresh Pricing Data
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Prepare chart data
    const categories = pricingData.categoryComparison.map((item: any) => item.category);
    const yourPrices = pricingData.categoryComparison.map((item: any) => item.yourAverage);
    const marketPrices = pricingData.categoryComparison.map((item: any) => item.marketAverage);
    
    const chartData = {
      labels: categories,
      datasets: [
        {
          label: 'Your Average Price',
          data: yourPrices,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Market Average',
          data: marketPrices,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Category Price Comparison</CardTitle>
            <CardDescription>Your domain pricing compared to market averages</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Bar 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Price ($)'
                    }
                  }
                }
              }} 
            />
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Above Market Average</h4>
                <div className="space-y-1">
                  {pricingData.aboveMarket && pricingData.aboveMarket.map((category: string, i: number) => (
                    <Badge key={i} variant="default" className="mr-2 mb-2">{category}</Badge>
                  ))}
                  {(!pricingData.aboveMarket || pricingData.aboveMarket.length === 0) && (
                    <p className="text-muted-foreground text-sm">No categories above market average</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Below Market Average</h4>
                <div className="space-y-1">
                  {pricingData.belowMarket && pricingData.belowMarket.map((category: string, i: number) => (
                    <Badge key={i} variant="secondary" className="mr-2 mb-2">{category}</Badge>
                  ))}
                  {(!pricingData.belowMarket || pricingData.belowMarket.length === 0) && (
                    <p className="text-muted-foreground text-sm">No categories below market average</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pricing Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {pricingData.recommendations && pricingData.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Render Market Demand Heat Index
  const renderMarketDemand = () => {
    if (isDemandLoading) {
      return (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="h-72">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="h-72">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (demandError) {
      return (
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error Loading Market Demand Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error fetching the market demand analysis.</p>
            <Button onClick={() => refetchDemand()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!demandData || !demandData.categoryDemand) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Market Demand Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No market demand data is available at this time.</p>
            <Button onClick={() => refetchDemand()} variant="outline" className="mt-4">
              Refresh Demand Data
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Prepare data for Category Demand chart
    const categoryLabels = demandData.categoryDemand.map((item: any) => item.category);
    const categoryScores = demandData.categoryDemand.map((item: any) => item.score);
    const categoryColors = generateColors(categoryLabels.length);
    
    const categoryChartData = {
      labels: categoryLabels,
      datasets: [
        {
          label: 'Demand Score',
          data: categoryScores,
          backgroundColor: categoryColors,
          borderColor: categoryColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
    
    // Prepare data for TLD Demand chart
    const tldLabels = demandData.tldDemand.map((item: any) => item.tld);
    const tldScores = demandData.tldDemand.map((item: any) => item.score);
    const tldColors = generateColors(tldLabels.length);
    
    const tldChartData = {
      labels: tldLabels,
      datasets: [
        {
          label: 'Demand Score',
          data: tldScores,
          backgroundColor: tldColors,
          borderColor: tldColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
    
    return (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Demand Heat Index</CardTitle>
              <CardDescription>Demand score for different domain categories (1-10)</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <Bar
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 10,
                      title: {
                        display: true,
                        text: 'Demand Score'
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>TLD Demand Heat Index</CardTitle>
              <CardDescription>Demand score for different TLDs (1-10)</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <Pie
                data={tldChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Rising Trends</CardTitle>
              <CardDescription>Keywords with increasing demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandData.risingTrends && demandData.risingTrends.map((trend: any, i: number) => (
                  <div key={i} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{trend.keyword}</h4>
                      <Badge variant="default">+{trend.growthPercentage}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{trend.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Declining Trends</CardTitle>
              <CardDescription>Keywords with decreasing demand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandData.decliningTrends && demandData.decliningTrends.map((trend: any, i: number) => (
                  <div key={i} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{trend.keyword}</h4>
                      <Badge variant="destructive">-{trend.declinePercentage}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{trend.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Industry Hotspots</CardTitle>
            <CardDescription>Industries showing highest domain acquisition activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {demandData.industryHotspots && Object.entries(demandData.industryHotspots).map(([industry, activity]: [string, any], i: number) => (
                <div key={i} className="bg-secondary/20 p-4 rounded-lg">
                  <h4 className="font-semibold">{industry}</h4>
                  <p className="text-sm">{typeof activity === 'string' ? activity : JSON.stringify(activity)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render Industry Benchmarks
  const renderBenchmarks = () => {
    if (isBenchmarkLoading) {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    
    if (benchmarkError) {
      return (
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle>Error Loading Benchmark Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error fetching the industry benchmark data.</p>
            <Button onClick={() => refetchBenchmarks()} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (!benchmarkData || !benchmarkData.performanceMetrics) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No Benchmark Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No industry benchmark data is available at this time.</p>
            <Button onClick={() => refetchBenchmarks()} variant="outline" className="mt-4">
              Refresh Benchmark Data
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Prepare data for Radar chart
    const radarData = {
      labels: benchmarkData.performanceMetrics.metrics,
      datasets: [
        {
          label: 'Your Marketplace',
          data: benchmarkData.performanceMetrics.yourValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
        },
        {
          label: 'Industry Average',
          data: benchmarkData.performanceMetrics.industryValues,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        },
      ],
    };
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics Comparison</CardTitle>
            <CardDescription>Your marketplace compared to industry averages</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Radar
              data={radarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarkData.keyMetrics && benchmarkData.keyMetrics.map((metric: any, i: number) => (
                  <div key={i} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{metric.name}</h4>
                      <div className="flex items-center gap-2">
                        <span>Your value: <strong>{metric.yourValue}</strong></span>
                        <span className="text-muted-foreground">|</span>
                        <span>Industry: {metric.industryValue}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {benchmarkData.recommendations && benchmarkData.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Render Domain Analysis
  const renderDomainAnalysis = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analyze Domain Names</CardTitle>
            <CardDescription>Enter domain names to analyze their potential value and market fit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="domains">
                  Domain Names (comma or space separated)
                </label>
                <textarea
                  id="domains"
                  rows={3}
                  placeholder="example.com, mydomain.org, best-shop.com"
                  className="w-full border rounded-md p-2"
                  value={domainsToAnalyze}
                  onChange={(e) => setDomainsToAnalyze(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAnalyzeDomains} 
                disabled={isAnalyzing || !domainsToAnalyze.trim()} 
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Analyzing...
                  </>
                ) : "Analyze Domains"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {analysisResults && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysisResults.domains && analysisResults.domains.map((domain: any, index: number) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <h3 className="text-lg font-semibold">{domain.name}</h3>
                    <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                      <div>
                        <span className="text-muted-foreground">Category:</span>{' '}
                        <Badge variant="outline">{domain.category}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Strength Score:</span>{' '}
                        <Badge variant={domain.score >= 8 ? "default" : domain.score >= 5 ? "secondary" : "outline"}>
                          {domain.score}/10
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Market Fit:</span>{' '}
                        <span>{domain.marketFit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estimated Value:</span>{' '}
                        <span>{domain.valueRange}</span>
                      </div>
                    </div>
                    {domain.notes && (
                      <div className="mt-2">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="text-sm">{domain.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* If the analysis doesn't have the expected format */}
                {!analysisResults.domains && (
                  <pre className="bg-secondary/20 p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(analysisResults, null, 2)}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Research Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time domain market analysis and industry insights
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      
      <Tabs defaultValue="news" onValueChange={setActiveTab} value={activeTab}>
        <div className="border-b">
          <TabsList className="h-12">
            <TabsTrigger value="news" className="flex items-center">
              <Newspaper className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Industry News</span>
              <span className="inline sm:hidden">News</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Pricing Trends</span>
              <span className="inline sm:hidden">Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="demand" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Market Demand</span>
              <span className="inline sm:hidden">Demand</span>
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Industry Benchmarks</span>
              <span className="inline sm:hidden">Benchmarks</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 3.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm3 8.5c0-1.38-2.595-2.5-6-2.5s-6 1.12-6 2.5v1h12v-1z" />
              </svg>
              <span className="hidden sm:inline">Domain Analysis</span>
              <span className="inline sm:hidden">Analyze</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="mt-6">
          <TabsContent value="news" className="mt-0">
            {renderNews()}
          </TabsContent>
          
          <TabsContent value="pricing" className="mt-0">
            {renderPricingTrends()}
          </TabsContent>
          
          <TabsContent value="demand" className="mt-0">
            {renderMarketDemand()}
          </TabsContent>
          
          <TabsContent value="benchmarks" className="mt-0">
            {renderBenchmarks()}
          </TabsContent>
          
          <TabsContent value="analyze" className="mt-0">
            {renderDomainAnalysis()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MarketResearchDashboard;