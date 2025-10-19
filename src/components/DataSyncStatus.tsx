/**
 * Data Sync Status Component
 * Shows users their data sync status and allows manual sync
 */

import { useState } from "react";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { supabase } from "../utils/supabaseClient";
import { forceSync } from "../utils/dataSyncUtils";
import { isMigrationDone } from "../utils/storageUtils";

interface DataSyncStatusProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function DataSyncStatus({ user }: DataSyncStatusProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const migrated = isMigrationDone();

  const handleManualSync = async () => {
    if (!user) {
      toast.error("Please log in to sync your data");
      return;
    }

    setIsSyncing(true);
    try {
      const success = await forceSync(user.accessToken);
      if (success) {
        setLastSyncTime(new Date());
      }
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <CloudOff className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Local Storage Only</p>
              <p className="text-xs text-gray-600">Sign in to sync your data to the cloud</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Cloud Sync Active</CardTitle>
          </div>
          <Badge variant="outline" className="border-green-300 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>
        <CardDescription>
          Your data is automatically backed up to the cloud
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Migration Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Migration Status:</span>
          <Badge variant={migrated ? "default" : "secondary"}>
            {migrated ? "Complete" : "Pending"}
          </Badge>
        </div>

        {/* Last Sync */}
        {lastSyncTime && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium">
              {lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Manual Sync Button */}
        <Button
          onClick={handleManualSync}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </>
          )}
        </Button>

        {/* Info */}
        <div className="flex items-start space-x-2 text-xs text-gray-600 bg-white p-2 rounded">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Your data is synced automatically. Manual sync is only needed if you experience issues.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
