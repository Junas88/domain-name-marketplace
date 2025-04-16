import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  endpoint: string,
  options?: RequestInit,
): Promise<Response> {
  const defaultOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  const res = await fetch(endpoint, mergedOptions);
  
  // Don't throw for 401 - caller will handle
  if (res.status !== 401) {
    await throwIfResNotOk(res);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Define a query client with stronger cache busting for contact-related queries
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable refetching when window regains focus
      refetchOnMount: 'always', // Always refetch when component mounts
      // Shorter stale time to improve responsiveness to content changes
      staleTime: 1000 * 60, // 1 minute
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Special handling for contact-related queries to never cache them
queryClient.setQueryDefaults(['/api/page-contents/contact', '/api/page-contents/contact-info'], {
  staleTime: 0, // Data is always considered stale
  gcTime: 0, // Don't keep unused data in cache (formerly called cacheTime in v4)
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchInterval: false,
  retry: false,
});
