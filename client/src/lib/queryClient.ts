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

// Define a query client with robust caching for admin and public data
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Don't refetch on window focus to maintain data persistence
      refetchOnMount: false, // Don't refetch when component mounts to maintain data persistence
      // Longer stale time to improve data persistence across navigation
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 15, // Keep data in cache for 15 minutes (formerly called cacheTime in v4)
      retry: false,
    },
    mutations: {
      retry: false,
      // Ensure mutations properly update the cache
      onSuccess: (_, __, ___, context) => {
        if (context?.queryKey) {
          queryClient.invalidateQueries({ queryKey: context.queryKey });
        }
      },
    },
  },
});

// Special handling for admin-specific queries to improve data persistence
queryClient.setQueryDefaults(['/api/admin/domains', '/api/domains', '/api/admin/page-contents', '/api/admin/seo-settings'], {
  staleTime: 1000 * 60 * 30, // 30 minutes - long stale time for admin data
  gcTime: 1000 * 60 * 60, // 60 minutes - long cache time for admin data
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: false,
});

// Special handling for contact-related queries to never cache them
queryClient.setQueryDefaults(['/api/page-contents/contact', '/api/page-contents/contact-info'], {
  staleTime: 0, // Data is always considered stale
  gcTime: 0, // Don't keep unused data in cache
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchInterval: false,
  retry: false,
});
