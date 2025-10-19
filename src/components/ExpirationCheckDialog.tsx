import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertCircle, Calendar } from "lucide-react";

interface ExpirationCheckDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpirationCheckDialog({ isOpen, onClose }: ExpirationCheckDialogProps) {
  const expiringItems = [
    { name: "Canned Goods (Corned Beef)", expiry: "Nov 15, 2025", daysLeft: 32, category: "Food" },
    { name: "Bottled Water", expiry: "Dec 20, 2025", daysLeft: 67, category: "Water" },
    { name: "First Aid Antiseptic", expiry: "Oct 30, 2025", daysLeft: 16, category: "Medical", urgent: true },
    { name: "Emergency Food Bars", expiry: "Jan 10, 2026", daysLeft: 88, category: "Food" },
    { name: "Batteries (AA)", expiry: "Nov 25, 2025", daysLeft: 42, category: "Tools" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Expiration Date Check</DialogTitle>
          <DialogDescription>
            Items that will expire in the next 90 days
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {expiringItems.map((item, index) => (
            <div key={index} className={`p-3 rounded-lg border ${item.urgent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.urgent && <AlertCircle className="h-4 w-4 text-red-600" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Expires: {item.expiry}
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {item.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${item.urgent ? 'text-red-600' : 'text-orange-600'}`}>
                    {item.daysLeft} days
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
