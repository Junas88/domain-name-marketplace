import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginData = {
  username: string;
  password: string;
};

interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation?: UseMutationResult<SelectUser, Error, any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Enhanced login mutation with better error handling and state management
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with credentials...");
      console.log("Login attempt with:", credentials.username);
      
      try {
        const res = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials)
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Authentication failed");
        }
        
        const userData = await res.json();
        console.log("Login response:", userData);
        return userData;
      } catch (error) {
        console.error("Login fetch error:", error);
        throw error;
      }
    },
    onSuccess: (userData: SelectUser) => {
      console.log("Setting user data in cache:", userData);
      
      // Use direct synchronous updates for state consistency
      queryClient.setQueryData(["/api/auth/user"], userData);
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard!",
      });
      
      // We'll rely on the redirect timer in the login page component
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your username and password",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}