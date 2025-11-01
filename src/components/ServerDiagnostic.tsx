import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, RefreshCw, Activity } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dd0f68d8`;

export function ServerDiagnostic() {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsChecking(true);
    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Health Check
      console.log("🔍 Running server diagnostic...");
      try {
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        diagnosticResults.tests.push({
          name: "Server Health Check",
          status: healthResponse.ok ? "pass" : "fail",
          data: healthData,
          statusCode: healthResponse.status
        });
        console.log("✅ Health check:", healthData);
      } catch (error: any) {
        diagnosticResults.tests.push({
          name: "Server Health Check",
          status: "fail",
          error: error.message
        });
        console.error("❌ Health check failed:", error);
      }

      // Test 2: Department Sign-In
      try {
        console.log("🔍 Testing department sign-in...");
        const signInResponse = await fetch(`${API_BASE}/department/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: "lgu@bantayalert.ph",
            password: "LGU2025!PH"
          })
        });

        const signInData = await signInResponse.json();
        
        // Analyze token format
        let tokenAnalysis = null;
        if (signInData.session?.token) {
          const token = signInData.session.token;
          tokenAnalysis = {
            prefix: token.substring(0, 5),
            hasPeriod: token.includes("."),
            partsCount: token.substring(5).split(".").length,
            length: token.length,
            sample: token.substring(0, 50) + "...",
            isValidFormat: token.startsWith("dept_") && token.includes(".") && token.substring(5).split(".").length === 2
          };
        }

        diagnosticResults.tests.push({
          name: "Department Sign-In",
          status: signInResponse.ok ? "pass" : "fail",
          data: {
            ...signInData,
            tokenAnalysis
          },
          statusCode: signInResponse.status
        });
        
        console.log("✅ Sign-in test:", { success: signInResponse.ok, tokenAnalysis });
      } catch (error: any) {
        diagnosticResults.tests.push({
          name: "Department Sign-In",
          status: "fail",
          error: error.message
        });
        console.error("❌ Sign-in test failed:", error);
      }

      // Test 3: Token Validation
      const storedUser = localStorage.getItem("USER");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.accessToken) {
            const token = user.accessToken;
            const tokenAnalysis = {
              prefix: token.substring(0, 5),
              hasPeriod: token.includes("."),
              partsCount: token.substring(5).split(".").length,
              length: token.length,
              sample: token.substring(0, 50) + "...",
              isValidFormat: token.startsWith("dept_") && token.includes(".") && token.substring(5).split(".").length === 2
            };
            
            diagnosticResults.tests.push({
              name: "Stored Token Validation",
              status: tokenAnalysis.isValidFormat ? "pass" : "fail",
              data: tokenAnalysis
            });
            console.log("Token analysis:", tokenAnalysis);
          }
        } catch (error: any) {
          diagnosticResults.tests.push({
            name: "Stored Token Validation",
            status: "fail",
            error: error.message
          });
        }
      }

    } finally {
      setResults(diagnosticResults);
      setIsChecking(false);
      console.log("📊 Diagnostic complete:", diagnosticResults);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Server Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostic} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Activity className="mr-2 h-4 w-4" />
              Run Diagnostic
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3 mt-4">
            <div className="text-sm text-muted-foreground">
              Test Time: {new Date(results.timestamp).toLocaleTimeString()}
            </div>
            
            {results.tests.map((test: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{test.name}</span>
                  <Badge variant={test.status === "pass" ? "default" : "destructive"}>
                    {test.status === "pass" ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {test.status}
                  </Badge>
                </div>
                
                {test.data && (
                  <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                    <pre>{JSON.stringify(test.data, null, 2)}</pre>
                  </div>
                )}
                
                {test.error && (
                  <div className="text-xs text-destructive">
                    Error: {test.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
