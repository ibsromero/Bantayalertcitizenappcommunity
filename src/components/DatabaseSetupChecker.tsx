import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Database, ExternalLink, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DatabaseDiagnostic } from "./DatabaseDiagnostic";
import { checkDatabaseSetup, getSetupInstructions } from "../utils/checkDatabaseSetup";
import type { SetupCheckResult } from "../utils/checkDatabaseSetup";

export function DatabaseSetupChecker() {
  const [result, setResult] = useState<SetupCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  async function checkSetup() {
    setIsChecking(true);
    try {
      const setupResult = await checkDatabaseSetup();
      setResult(setupResult);
    } catch (error) {
      console.error("Failed to check setup:", error);
    } finally {
      setIsChecking(false);
    }
  }

  if (isChecking) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 animate-pulse text-blue-600" />
            <span className="text-sm text-blue-900">Checking database setup...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  if (result.isSetupComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Database Setup Complete
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-green-300 text-green-700">
                Ready
              </Badge>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Wrench className="h-3 w-3 mr-1" />
                    Diagnostic
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Database Diagnostic</DialogTitle>
                    <DialogDescription>
                      View detailed diagnostic information about your database connection and tables
                    </DialogDescription>
                  </DialogHeader>
                  <DatabaseDiagnostic />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Database Setup Required</CardTitle>
          </div>
          <Button size="sm" onClick={checkSetup} variant="outline" className="border-red-300">
            Recheck
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-red-700">
          The database tables don't exist yet. You need to run the SQL setup script in Supabase.
        </p>

        {/* Missing Tables */}
        {result.missingTables.length > 0 && (
          <div>
            <p className="text-sm font-medium text-red-900 mb-2">Missing Tables:</p>
            <div className="flex flex-wrap gap-2">
              {result.missingTables.map((table) => (
                <Badge key={table} variant="destructive">
                  {table}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sample Data Status */}
        {!result.sampleDataExists && (
          <div>
            <p className="text-sm font-medium text-red-900 mb-2">Missing Sample Data:</p>
            <div className="space-y-1 text-sm text-red-700">
              <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                <span>Department Accounts:</span>
                <Badge variant={result.departmentCount >= 5 ? "default" : "destructive"}>
                  {result.departmentCount}/5
                </Badge>
              </div>
              <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                <span>NCR Hospitals:</span>
                <Badge variant={result.hospitalCount >= 8 ? "default" : "destructive"}>
                  {result.hospitalCount}/8
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {result.warnings && result.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-900 mb-2">⚠️ Warnings:</p>
            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
              {result.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-gray-900">
            {result.missingTables.length > 0 ? "Quick Setup (5 minutes):" : "Load Sample Data:"}
          </p>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Open Supabase Dashboard</li>
            <li>Go to SQL Editor → New Query</li>
            <li>
              Open <code className="bg-gray-100 px-1 rounded">/SUPABASE_REALTIME_SETUP.sql</code>
            </li>
            <li><strong>Copy ALL the SQL</strong> (Ctrl+A, then Ctrl+C)</li>
            <li>Paste in Supabase SQL Editor (Ctrl+V)</li>
            <li>Click RUN (or press Ctrl+Enter)</li>
            {result.missingTables.length === 0 && (
              <li className="text-blue-700">
                ℹ️ Tables exist - this will only insert missing sample data
              </li>
            )}
            <li>Enable Realtime for the tables (Database → Replication)</li>
            <li>Refresh this page</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            asChild
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase Dashboard
            </a>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 border-red-300">
                <Wrench className="h-4 w-4 mr-2" />
                Run Diagnostic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Database Diagnostic Tool</DialogTitle>
                <DialogDescription>
                  Check your database connection status and table configuration
                </DialogDescription>
              </DialogHeader>
              <DatabaseDiagnostic />
            </DialogContent>
          </Dialog>
        </div>

        {/* Errors */}
        {result.errors.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-red-700 font-medium">
              Show Errors ({result.errors.length})
            </summary>
            <div className="mt-2 space-y-1 bg-white rounded p-2 max-h-32 overflow-y-auto">
              {result.errors.map((error, i) => (
                <div key={i} className="text-red-600 font-mono">
                  {error}
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
