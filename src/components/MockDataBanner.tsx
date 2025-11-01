import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";

export function MockDataBanner() {
  return (
    <Alert className="mb-4 border-blue-300 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Demo Mode:</strong> Viewing sample data. All updates are simulated and won't be saved. 
        Deploy the Supabase Edge Function to enable live data persistence.
        <div className="mt-1 text-sm">
          To enable live data: Set <code className="bg-blue-100 px-1 rounded">USE_MOCK_DATA = false</code> in <code className="bg-blue-100 px-1 rounded">/utils/departmentApiService.ts</code> after deploying the Edge Function.
        </div>
      </AlertDescription>
    </Alert>
  );
}
