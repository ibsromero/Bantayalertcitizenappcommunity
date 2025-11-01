import { useState } from "react";
import { Database, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { supabase } from "../utils/supabaseClient";

interface TableInfo {
  name: string;
  exists: boolean;
  count: number;
  error?: string;
}

export function DatabaseDiagnostic() {
  const [isChecking, setIsChecking] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  async function checkDatabase() {
    setIsChecking(true);
    const tablesToCheck = [
      "department_users",
      "sos_alerts",
      "disaster_events",
      "hospitals",
      "weather_warnings",
      "analytics_summary",
    ];

    const results: TableInfo[] = [];

    for (const tableName of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        results.push({
          name: tableName,
          exists: !error,
          count: count || 0,
          error: error?.message,
        });
      } catch (error: any) {
        results.push({
          name: tableName,
          exists: false,
          count: 0,
          error: error.message || "Unknown error",
        });
      }
    }

    setTables(results);
    setLastChecked(new Date());
    setIsChecking(false);
  }

  const allTablesExist = tables.length > 0 && tables.every((t) => t.exists);
  const hasSampleData =
    tables.find((t) => t.name === "department_users")?.count >= 5 &&
    tables.find((t) => t.name === "hospitals")?.count >= 8;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <CardTitle>Database Diagnostic</CardTitle>
          </div>
          <Button
            onClick={checkDatabase}
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            Check Database
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastChecked && (
          <div className="text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {tables.length === 0 ? (
          <div className="text-sm text-gray-600 py-8 text-center">
            Click "Check Database" to verify your setup
          </div>
        ) : (
          <div className="space-y-2">
            {/* Overall Status */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <span className="font-medium">Overall Status:</span>
              {allTablesExist && hasSampleData ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Incomplete
                </Badge>
              )}
            </div>

            {/* Table Details */}
            <div className="space-y-1">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className="flex items-center justify-between bg-white border rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    {table.exists ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-mono text-sm">{table.name}</div>
                      {table.error && (
                        <div className="text-xs text-red-600 mt-1">{table.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {table.exists && (
                      <Badge variant="outline" className="font-mono">
                        {table.count} rows
                      </Badge>
                    )}
                    {table.exists ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Exists
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sample Data Check */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="font-medium text-blue-900 text-sm">Sample Data:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs">
                  <span className="text-gray-600">Department accounts:</span>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${
                      (tables.find((t) => t.name === "department_users")?.count || 0) >= 5
                        ? "border-green-300 text-green-700"
                        : "border-red-300 text-red-700"
                    }`}
                  >
                    {tables.find((t) => t.name === "department_users")?.count || 0}/5
                  </Badge>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">Hospitals:</span>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${
                      (tables.find((t) => t.name === "hospitals")?.count || 0) >= 8
                        ? "border-green-300 text-green-700"
                        : "border-red-300 text-red-700"
                    }`}
                  >
                    {tables.find((t) => t.name === "hospitals")?.count || 0}/8
                  </Badge>
                </div>
              </div>
            </div>

            {/* Fix Instructions */}
            {(!allTablesExist || !hasSampleData) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="font-medium text-yellow-900 text-sm mb-2">
                  Action Required:
                </div>
                <div className="text-xs text-yellow-800 space-y-1">
                  <div>1. Open <code className="bg-yellow-100 px-1 rounded">/SUPABASE_REALTIME_SETUP.sql</code></div>
                  <div>2. Copy ALL the SQL code</div>
                  <div>3. Paste in Supabase Dashboard → SQL Editor</div>
                  <div>4. Click RUN</div>
                  <div>5. Return here and click "Check Database" again</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
