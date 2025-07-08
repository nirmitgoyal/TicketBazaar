import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  details?: string;
}

export default function OAuthTest() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [authEndpointResult, setAuthEndpointResult] = useState<any>(null);

  useEffect(() => {
    runClientSideTests();
  }, []);

  const runClientSideTests = () => {
    const results: TestResult[] = [];
    
    // Test 1: Check browser environment
    results.push({
      name: "Browser Environment",
      status: "pass",
      message: "Browser detected",
      details: navigator.userAgent
    });
    
    // Test 2: Check cookies enabled
    const cookiesEnabled = navigator.cookieEnabled;
    results.push({
      name: "Cookies Enabled",
      status: cookiesEnabled ? "pass" : "fail",
      message: cookiesEnabled ? "Cookies are enabled" : "Cookies are disabled",
      details: cookiesEnabled ? undefined : "Enable cookies in your browser settings"
    });
    
    // Test 3: Check current URL
    const currentUrl = window.location.href;
    const isHttps = currentUrl.startsWith('https://');
    results.push({
      name: "Protocol Check",
      status: isHttps ? "pass" : "warning",
      message: `Using ${isHttps ? 'HTTPS' : 'HTTP'} protocol`,
      details: currentUrl
    });
    
    // Test 4: Check session storage
    try {
      sessionStorage.setItem('oauth-test', 'true');
      sessionStorage.removeItem('oauth-test');
      results.push({
        name: "Session Storage",
        status: "pass",
        message: "Session storage is working"
      });
    } catch (e) {
      results.push({
        name: "Session Storage",
        status: "fail",
        message: "Session storage not available",
        details: "Private browsing mode may cause issues"
      });
    }
    
    // Test 5: Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');
    
    if (error) {
      results.push({
        name: "OAuth Error in URL",
        status: "fail",
        message: `OAuth error: ${error}`,
        details: errorMessage || "Check server logs for details"
      });
    }
    
    // Test 6: Authentication state
    results.push({
      name: "Authentication State",
      status: isAuthenticated ? "pass" : "info",
      message: isAuthenticated ? "User is authenticated" : "User is not authenticated",
      details: isAuthenticated ? `Email: ${user?.email}` : undefined
    });
    
    setTestResults(results);
  };
  
  const testAuthEndpoint = async () => {
    setIsTestingAuth(true);
    
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const data = await response.json();
      setAuthEndpointResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
      
      setTestResults(prev => [...prev, {
        name: "Auth Endpoint Test",
        status: response.ok ? "pass" : "fail",
        message: `Status: ${response.status}`,
        details: JSON.stringify(data, null, 2)
      }]);
    } catch (error: any) {
      setAuthEndpointResult({
        error: error.message
      });
      
      setTestResults(prev => [...prev, {
        name: "Auth Endpoint Test",
        status: "fail",
        message: "Failed to reach auth endpoint",
        details: error.message
      }]);
    } finally {
      setIsTestingAuth(false);
    }
  };
  
  const handleTestGoogleOAuth = () => {
    // Open a new window to test OAuth flow
    const authWindow = window.open('/api/auth/google', 'oauth-test', 'width=500,height=600');
    
    // Monitor the window
    const checkInterval = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkInterval);
        // Refresh our auth state
        window.location.reload();
      }
    }, 1000);
  };
  
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Google OAuth 2.0 Diagnostics</CardTitle>
          <CardDescription>
            Test and troubleshoot your Google OAuth implementation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Auth Status */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Current Authentication Status</h3>
            {isLoading ? (
              <p className="text-gray-600">Loading...</p>
            ) : isAuthenticated ? (
              <div className="space-y-1">
                <p className="text-green-600 font-medium">✓ Authenticated</p>
                <p className="text-sm text-gray-600">Email: {user?.email}</p>
                <p className="text-sm text-gray-600">Name: {user?.name}</p>
                <p className="text-sm text-gray-600">Instagram: {user?.instagram || 'Not set'}</p>
              </div>
            ) : (
              <p className="text-amber-600">⚠ Not authenticated</p>
            )}
          </div>
          
          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="font-semibold">Diagnostic Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <p className="font-medium">{result.name}</p>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  {result.details && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {result.details}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={testAuthEndpoint} 
              disabled={isTestingAuth}
              className="w-full"
            >
              {isTestingAuth ? "Testing..." : "Test Auth Endpoint"}
            </Button>
            
            <Button 
              onClick={handleTestGoogleOAuth}
              variant="outline"
              className="w-full"
            >
              Test Google OAuth Login
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
          
          {/* Common Issues */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Common Issues:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Redirect URI mismatch - Check Google Console</li>
                <li>Cookies blocked - Check browser settings</li>
                <li>Session expired - Clear cookies and try again</li>
                <li>Invalid credentials - Verify CLIENT_ID and SECRET</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {/* Debug Info */}
          {authEndpointResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">Auth Endpoint Response:</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(authEndpointResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}