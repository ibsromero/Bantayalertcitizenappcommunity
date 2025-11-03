import { useState, useEffect } from "react";
import { Package, Plus, Check, AlertCircle, Battery, Droplets, Users, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner@2.0.3";
import { ExpirationCheckDialog } from "./ExpirationCheckDialog";
import { EquipmentTestDialog } from "./EquipmentTestDialog";
import { saveToStorage, getFromStorage } from "../utils/storageUtils";
import { logActivity } from "../utils/activityUtils";
import { saveUserData, getUserData } from "../utils/supabaseClient";

interface EmergencyKitProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

interface KitItem {
  name: string;
  quantity: string;
  status: "ready" | "partial" | "missing" | "na";
  priority: "high" | "medium" | "low";
  perPerson?: boolean;
}

// Icon mapping - icons can't be serialized to JSON
const categoryIcons = {
  food: Droplets,
  tools: Battery,
  safety: AlertCircle,
};

export function EmergencyKit({ user }: EmergencyKitProps) {
  const [showExpirationDialog, setShowExpirationDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [addItemCategory, setAddItemCategory] = useState("");
  const [familyMembers, setFamilyMembers] = useState(() => {
    return getFromStorage<number>("FAMILY_MEMBERS") || 4;
  });
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    status: "missing" as const,
    priority: "medium" as const,
    perPerson: false,
  });

  const getDefaultKitData = () => ({
    food: {
      name: "Food & Water",
      items: [
        { name: "Water (1 gallon per person per day)", quantity: "3", status: "ready", priority: "high", perPerson: true },
        { name: "Non-perishable food (3-day supply)", quantity: "6 cans", status: "ready", priority: "high", perPerson: true },
        { name: "Can opener", quantity: "1", status: "ready", priority: "medium", perPerson: false },
        { name: "Emergency food bars", quantity: "3 bars", status: "missing", priority: "medium", perPerson: true },
        { name: "Baby formula/food", quantity: "N/A", status: "na", priority: "low", perPerson: false },
      ] as KitItem[]
    },
    tools: {
      name: "Tools & Supplies",
      items: [
        { name: "Flashlight", quantity: "2", status: "ready", priority: "high", perPerson: false },
        { name: "Battery-powered radio", quantity: "1", status: "ready", priority: "high", perPerson: false },
        { name: "Extra batteries", quantity: "8 AA, 4 D", status: "partial", priority: "high", perPerson: false },
        { name: "Multi-tool", quantity: "1", status: "ready", priority: "medium", perPerson: false },
        { name: "Duct tape", quantity: "1 roll", status: "missing", priority: "medium", perPerson: false },
        { name: "Plastic sheeting", quantity: "10 ft", status: "missing", priority: "medium", perPerson: false },
      ] as KitItem[]
    },
    safety: {
      name: "Safety & Medical",
      items: [
        { name: "First aid kit", quantity: "1 complete", status: "ready", priority: "high", perPerson: false },
        { name: "Prescription medications", quantity: "7-day supply", status: "ready", priority: "high", perPerson: true },
        { name: "Emergency blankets", quantity: "1", status: "partial", priority: "medium", perPerson: true },
        { name: "Fire extinguisher", quantity: "1", status: "ready", priority: "medium", perPerson: false },
        { name: "Smoke/CO detector batteries", quantity: "6", status: "missing", priority: "medium", perPerson: false },
      ] as KitItem[]
    }
  });

  const [kitCategories, setKitCategories] = useState(() => {
    const saved = getFromStorage("EMERGENCY_KIT");
    if (saved && typeof saved === 'object' && saved.food && saved.tools && saved.safety) {
      return saved;
    }
    return getDefaultKitData();
  });

  // Load from cloud
  useEffect(() => {
    if (user?.accessToken) {
      getUserData("emergency_kit", user.accessToken).then(({ data }) => {
        if (data) {
          setKitCategories(data.categories);
          setFamilyMembers(data.familyMembers || 4);
          saveToStorage("EMERGENCY_KIT", data.categories);
          saveToStorage("FAMILY_MEMBERS", data.familyMembers || 4);
        }
      }).catch(error => {
        console.error('Error loading emergency kit:', error);
      });
    }
  }, [user?.accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to storage and cloud whenever kit changes
  useEffect(() => {
    saveToStorage("EMERGENCY_KIT", kitCategories);
    saveToStorage("FAMILY_MEMBERS", familyMembers);
    
    if (user?.accessToken) {
      saveUserData("emergency_kit", { categories: kitCategories, familyMembers }, user.accessToken);
    }
  }, [kitCategories, familyMembers, user?.accessToken]);

  // Calculate suggested quantities based on family members
  const calculateQuantity = (item: KitItem): string => {
    if (!item.perPerson) return item.quantity;
    
    const baseQty = parseInt(item.quantity) || 1;
    const calculated = baseQty * familyMembers;
    const unit = item.quantity.replace(/[0-9]/g, '').trim();
    
    return `${calculated} ${unit}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "text-green-700 border-green-300";
      case "partial": return "text-orange-700 border-orange-300";
      case "missing": return "text-red-700 border-red-300";
      default: return "text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <Check className="h-4 w-4 text-green-600" />;
      case "partial": return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "missing": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const handleStatusChange = (category: string, itemIndex: number, newStatus: string) => {
    setKitCategories(prev => {
      const updated = { ...prev };
      (updated[category as keyof typeof prev].items[itemIndex] as any).status = newStatus;
      return updated;
    });

    toast.success("Item status updated");
    logActivity("kit_item_updated", `Updated ${kitCategories[category as keyof typeof kitCategories].items[itemIndex].name}`, user?.accessToken);
  };

  const handleAddItem = (category: string) => {
    setAddItemCategory(category);
    setShowAddItemDialog(true);
  };

  const handleSaveNewItem = () => {
    if (newItem.name && newItem.quantity) {
      setKitCategories(prev => {
        const updated = { ...prev };
        (updated[addItemCategory as keyof typeof prev].items as any[]).push({ ...newItem });
        return updated;
      });

      toast.success("Item added to kit");
      logActivity("kit_item_added", `Added ${newItem.name} to emergency kit`, user?.accessToken);

      setNewItem({ name: "", quantity: "", status: "missing", priority: "medium", perPerson: false });
      setShowAddItemDialog(false);
    }
  };

  const handleCheckExpiration = () => {
    setShowExpirationDialog(true);
    logActivity("kit_tested", "Checked expiration dates", user?.accessToken);
  };

  const handleTestEquipment = () => {
    setShowTestDialog(true);
    logActivity("kit_tested", "Tested equipment", user?.accessToken);
  };

  const handleDeleteItem = (category: string, itemIndex: number) => {
    const itemName = kitCategories[category as keyof typeof kitCategories].items[itemIndex].name;
    
    setKitCategories(prev => {
      const updated = { ...prev };
      (updated[category as keyof typeof prev].items as any[]).splice(itemIndex, 1);
      return updated;
    });

    toast.success("Item removed from kit");
    logActivity("kit_item_deleted", `Removed ${itemName} from emergency kit`, user?.accessToken);
  };

  const KitItem = ({ item, category, index }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 group">
      <div className="flex-1">
        <p className="font-medium text-sm">{item.name}</p>
        <p className="text-xs text-gray-500">
          Suggested Qty: {calculateQuantity(item)}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {getStatusIcon(item.status)}
        <Select 
          value={item.status} 
          onValueChange={(value) => handleStatusChange(category, index, value)}
        >
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
            <SelectItem value="na">N/A</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleDeleteItem(category, index)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  );

  const calculateProgress = (items: KitItem[]): number => {
    if (!items || !Array.isArray(items)) return 0;
    
    const applicable = items.filter(i => i.status !== "na");
    const ready = applicable.filter(i => i.status === "ready").length;
    const partial = applicable.filter(i => i.status === "partial").length;
    
    if (applicable.length === 0) return 100;
    return Math.round(((ready + partial * 0.5) / applicable.length) * 100);
  };

  const CategoryTab = ({ category, data }: any) => {
    if (!data || !data.items) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No items in this category</p>
            <Button 
              variant="outline" 
              className="mt-4 touch-manipulation min-h-[44px]"
              onClick={() => handleAddItem(category)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      );
    }

    const progress = calculateProgress(data.items);
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {IconComponent && <IconComponent className="h-5 w-5" />}
              <span>{data.name}</span>
            </div>
            <Badge variant="secondary">{progress}% Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="space-y-1">
            {data.items.map((item: any, index: number) => (
              <KitItem key={index} item={item} category={category} index={index} />
            ))}
          </div>
          <Button 
            variant="outline" 
            className="w-full touch-manipulation min-h-[44px] active:scale-95 transition-transform"
            onClick={() => handleAddItem(category)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Add Item</span>
          </Button>
        </CardContent>
      </Card>
    );
  };

  const overallProgress = Math.round(
    Object.values(kitCategories).reduce((acc, cat) => {
      if (!cat || !cat.items) return acc;
      return acc + calculateProgress(cat.items);
    }, 0) / Object.keys(kitCategories).length
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Emergency Kit</h1>
        <Badge variant="outline" className="text-blue-700 border-blue-300 whitespace-nowrap">
          {overallProgress}% Ready
        </Badge>
      </div>

      {/* Family Members Setting */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Family Members</p>
                <p className="text-xs text-gray-500">Adjusts supply calculations</p>
              </div>
            </div>
            <Select 
              value={familyMembers.toString()} 
              onValueChange={(value) => {
                setFamilyMembers(parseInt(value));
                toast.success(`Family size set to ${value} members`);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Category Overview */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Object.entries(kitCategories).map(([key, category]) => {
          if (!category) return null;
          const progress = calculateProgress(category.items || []);
          const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
          return (
            <Card key={key} className="text-center">
              <CardContent className="p-2 sm:p-3">
                {IconComponent && <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-gray-600" />}
                <p className="text-xs sm:text-sm font-medium leading-tight">{category.name}</p>
                <p className="text-xs text-gray-500">{progress}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Kit Contents */}
      <Tabs defaultValue="food" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="food" className="text-xs sm:text-sm">Food & Water</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs sm:text-sm">Tools</TabsTrigger>
          <TabsTrigger value="safety" className="text-xs sm:text-sm">Safety</TabsTrigger>
        </TabsList>
        {Object.entries(kitCategories).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <CategoryTab category={key} data={category} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-green-900 mb-2">Kit Maintenance</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start border-green-300 touch-manipulation min-h-[44px] active:scale-95 transition-transform"
              onClick={handleCheckExpiration}
            >
              <Package className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Check Expiration Dates</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-green-300 touch-manipulation min-h-[44px] active:scale-95 transition-transform"
              onClick={handleTestEquipment}
            >
              <Battery className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Test Equipment</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your emergency kit inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Bottled Water"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemQuantity">Quantity</Label>
              <Input
                id="itemQuantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g., 12 bottles"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemStatus">Status</Label>
              <Select 
                value={newItem.status} 
                onValueChange={(value: any) => setNewItem(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="itemStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemPriority">Priority</Label>
              <Select 
                value={newItem.priority} 
                onValueChange={(value: any) => setNewItem(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger id="itemPriority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="perPerson"
                checked={newItem.perPerson}
                onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, perPerson: !!checked }))}
              />
              <Label htmlFor="perPerson" className="text-sm cursor-pointer">
                Scale quantity per family member
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewItem} disabled={!newItem.name || !newItem.quantity}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExpirationCheckDialog
        isOpen={showExpirationDialog}
        onClose={() => setShowExpirationDialog(false)}
      />
      <EquipmentTestDialog
        isOpen={showTestDialog}
        onClose={() => setShowTestDialog(false)}
      />
    </div>
  );
}
