import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface NavigationProps {
  currentSection: string;
  onBack: () => void;
}

export function Navigation({ currentSection, onBack }: NavigationProps) {
  const getSectionTitle = (section: string) => {
    switch (section) {
      case "emergency": return "Emergency Contacts";
      case "checklist": return "Preparation Checklist";
      case "kit": return "Emergency Kit";
      case "alerts": return "Weather Alerts";
      case "evacuation": return "Evacuation Routes";
      case "resources": return "Resources";
      default: return "bantayalert";
    }
  };

  if (currentSection === "dashboard") {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="touch-manipulation min-h-[44px] min-w-[44px] active:scale-95 transition-transform">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">
          {getSectionTitle(currentSection)}
        </h1>
      </div>
    </div>
  );
}