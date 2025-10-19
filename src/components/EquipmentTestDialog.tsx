import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner@2.0.3";
import { Battery, Radio, Lightbulb, Wrench } from "lucide-react";

interface EquipmentTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentTestDialog({ isOpen, onClose }: EquipmentTestDialogProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const equipmentList = [
    { id: "flashlight", name: "Flashlight", icon: Lightbulb, instructions: "Check batteries and bulb" },
    { id: "radio", name: "Battery-powered Radio", icon: Radio, instructions: "Test AM/FM reception" },
    { id: "batteries", name: "Spare Batteries", icon: Battery, instructions: "Check charge level" },
    { id: "tools", name: "Multi-tool", icon: Wrench, instructions: "Ensure all functions work" },
  ];

  const handleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleComplete = () => {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    toast.success(`Equipment test completed`, {
      description: `${checkedCount} out of ${equipmentList.length} items tested`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Equipment Testing Checklist</DialogTitle>
          <DialogDescription>
            Test your emergency equipment monthly to ensure readiness
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {equipmentList.map((item) => (
            <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200">
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || false}
                onCheckedChange={() => handleCheck(item.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor={item.id} className="flex items-center space-x-2 cursor-pointer">
                  <item.icon className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{item.name}</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">{item.instructions}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleComplete} className="flex-1">
            Complete Test
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
