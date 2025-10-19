import { useState, useEffect } from "react";
import { CheckCircle, Circle, AlertTriangle, Home, Waves, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner@2.0.3";
import { CommunicationPlanDialog } from "./CommunicationPlanDialog";
import { logActivity } from "../utils/activityUtils";
import { saveUserData, getUserData } from "../utils/supabaseClient";
import { saveToStorage, getFromStorage } from "../utils/storageUtils";

interface PreparationChecklistProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

// Icon mapping - icons can't be serialized to JSON
const checklistIcons = {
  earthquake: Home,
  flood: Waves,
  typhoon: Wind,
};

export function PreparationChecklist({ user }: PreparationChecklistProps) {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [checklists, setChecklists] = useState({
    earthquake: {
      name: "Earthquake",
      progress: 75,
      items: [
        { id: 1, text: "Secure heavy furniture and appliances", completed: true },
        { id: 2, text: "Identify safe spots in each room", completed: true },
        { id: 3, text: "Practice drop, cover, and hold on", completed: true },
        { id: 4, text: "Prepare emergency shut-off procedures", completed: false },
        { id: 5, text: "Create family communication plan", completed: false },
        { id: 6, text: "Store emergency supplies in accessible location", completed: true },
      ]
    },
    flood: {
      name: "Flood",
      progress: 50,
      items: [
        { id: 1, text: "Know your evacuation routes", completed: true },
        { id: 2, text: "Prepare sandbags and barriers", completed: false },
        { id: 3, text: "Move important items to higher floors", completed: true },
        { id: 4, text: "Review flood insurance policy", completed: false },
        { id: 5, text: "Install sump pump backup power", completed: false },
        { id: 6, text: "Prepare waterproof document storage", completed: true },
      ]
    },
    typhoon: {
      name: "Typhoon",
      progress: 60,
      items: [
        { id: 1, text: "Install storm shutters or plywood", completed: true },
        { id: 2, text: "Trim trees and remove loose outdoor items", completed: true },
        { id: 3, text: "Stock up on fuel and water", completed: false },
        { id: 4, text: "Test generator and backup power", completed: true },
        { id: 5, text: "Review evacuation plan", completed: false },
        { id: 6, text: "Prepare cash in small bills", completed: false },
      ]
    }
  });

  useEffect(() => {
    // Load checklists from storage on mount
    const saved = getFromStorage("CHECKLISTS");
    if (saved) {
      setChecklists(saved);
    }

    // Load from cloud if user is logged in
    if (user?.accessToken) {
      getUserData("checklists", user.accessToken).then(({ data }) => {
        if (data) {
          setChecklists(data);
          saveToStorage("CHECKLISTS", data);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    // Save checklists whenever they change
    saveToStorage("CHECKLISTS", checklists);
    
    // Sync to cloud if logged in
    if (user?.accessToken) {
      saveUserData("checklists", checklists, user.accessToken);
    }
  }, [checklists, user]);

  const handleToggleItem = (type: string, itemId: number) => {
    setChecklists(prev => {
      const updatedChecklist = { ...prev };
      const category = updatedChecklist[type as keyof typeof prev];
      const itemIndex = category.items.findIndex((item: any) => item.id === itemId);
      
      if (itemIndex !== -1) {
        category.items[itemIndex].completed = !category.items[itemIndex].completed;
        
        const completedCount = category.items.filter((item: any) => item.completed).length;
        category.progress = Math.round((completedCount / category.items.length) * 100);
        
        const completed = category.items[itemIndex].completed;
        toast.success(
          completed ? "Task completed" : "Task marked incomplete",
          { description: category.items[itemIndex].text }
        );

        // Log activity
        logActivity(
          completed ? "checklist_completed" : "checklist_updated",
          completed ? `Completed: ${category.items[itemIndex].text}` : `Updated: ${category.items[itemIndex].text}`,
          user?.accessToken
        );
      }
      
      return updatedChecklist;
    });
  };

  const handleCompleteNow = () => {
    setShowPlanDialog(true);
  };

  const ChecklistItem = ({ item, onToggle, type }: any) => (
    <div className="flex items-center space-x-3 py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(type, item.id)}
        className="p-2 h-auto touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
      >
        {item.completed ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400" />
        )}
      </Button>
      <span className={`flex-1 text-sm sm:text-base ${item.completed ? 'line-through text-gray-500' : ''}`}>
        {item.text}
      </span>
    </div>
  );

  const ChecklistTab = ({ type, checklist }: any) => {
    const IconComponent = checklistIcons[type as keyof typeof checklistIcons];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {IconComponent && <IconComponent className="h-5 w-5" />}
              <span>{checklist.name} Preparedness</span>
            </div>
            <Badge variant="secondary">{checklist.progress}% Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={checklist.progress} className="w-full" />
          <div className="space-y-1">
            {checklist.items.map((item: any) => (
              <ChecklistItem
                key={item.id}
                item={item}
                type={type}
                onToggle={handleToggleItem}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Preparation Checklist</h1>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          3 Active Lists
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Object.entries(checklists).map(([key, checklist]) => {
          const IconComponent = checklistIcons[key as keyof typeof checklistIcons];
          return (
            <Card key={key} className="text-center">
              <CardContent className="p-2 sm:p-3">
                {IconComponent && <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-gray-600" />}
                <p className="text-xs sm:text-sm font-medium">{checklist.name}</p>
                <p className="text-xs text-gray-500">{checklist.progress}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Checklists */}
      <Tabs defaultValue="earthquake" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="earthquake" className="text-xs sm:text-sm">Earthquake</TabsTrigger>
          <TabsTrigger value="flood" className="text-xs sm:text-sm">Flood</TabsTrigger>
          <TabsTrigger value="typhoon" className="text-xs sm:text-sm">Typhoon</TabsTrigger>
        </TabsList>
        {Object.entries(checklists).map(([key, checklist]) => (
          <TabsContent key={key} value={key}>
            <ChecklistTab type={key} checklist={checklist} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Priority Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Priority Action Needed</h3>
              <p className="text-sm text-orange-700 mt-1">
                Complete your emergency communication plan. This is critical for keeping your family safe and connected during disasters.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 border-orange-300 text-orange-700 touch-manipulation min-h-[40px] active:scale-95 transition-transform"
                onClick={handleCompleteNow}
              >
                Complete Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CommunicationPlanDialog
        isOpen={showPlanDialog}
        onClose={() => setShowPlanDialog(false)}
        user={user}
      />
    </div>
  );
}