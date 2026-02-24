"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Wait for Google script to load
    const checkGoogleReady = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleSignIn();
      } else {
        setTimeout(checkGoogleReady, 100);
      }
    };

    const initializeGoogleSignIn = () => {
      const clientId = process.env.NEXT_PUBLIC_GCP_CLIENT_ID;
      
      if (!clientId) {
        setError("Google Client ID not configured. Please set NEXT_PUBLIC_GCP_CLIENT_ID environment variable.");
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        const buttonContainer = document.getElementById("google-signin-button");
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            width: "280",
          });
          setGoogleReady(true);
        }
      } catch (err) {
        setError(`Failed to initialize Google Sign-In: ${err}`);
      }
    };

    checkGoogleReady();
  }, []);

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Send token to backend
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Authentication failed");
        setIsLoading(false);
        return;
      }

      // Store JWT token in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Analytics Dashboard</CardTitle>
          <CardDescription>
            Sign in with your @rbg.iitm.ac.in email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!googleReady && !error && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading sign-in...</p>
            </div>
          )}

          {googleReady && <div id="google-signin-button" className="flex justify-center" />}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sign-in Error</p>
                <p className="text-sm mt-1">{error}</p>
                {error.includes("Client ID") && (
                  <p className="text-xs mt-2 font-mono">
                    Set NEXT_PUBLIC_GCP_CLIENT_ID in .env.local
                  </p>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Authenticating...</p>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p><strong>Access Policy:</strong></p>
            <p className="mt-1">Only @rbg.iitm.ac.in email addresses are allowed to access this dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
