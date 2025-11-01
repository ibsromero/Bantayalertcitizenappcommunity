import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";

interface TokenErrorBannerProps {
  onClearTokens: () => void;
}

export function TokenErrorBanner({ onClearTokens }: TokenErrorBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-900/95 backdrop-blur">
      <Alert className="border-red-300 bg-red-50 max-w-4xl mx-auto">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-red-900 mb-1">
                ⚠️ <strong>Invalid Token Detected</strong>
              </h3>
              <p className="text-red-800 text-sm mb-3">
                Your session token is in an old format and causing authentication errors.
                Clear your tokens and sign in again to fix this.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={onClearTokens}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Tokens Now
                </Button>
                <Button
                  onClick={() => window.open('/clear-token.html', '_blank')}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  size="sm"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Token Clearer
                </Button>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
