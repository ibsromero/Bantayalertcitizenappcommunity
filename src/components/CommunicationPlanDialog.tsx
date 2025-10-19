import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";
import { saveToStorage, getFromStorage } from "../utils/storageUtils";
import { logActivity } from "../utils/activityUtils";

interface CommunicationPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function CommunicationPlanDialog({ isOpen, onClose, user }: CommunicationPlanDialogProps) {
  const [formData, setFormData] = useState({
    meetingPoint: "",
    outOfTownContact: "",
    emergencyNumber: "",
    notes: "",
  });

  useEffect(() => {
    // Load existing plan if available
    const savedPlan = getFromStorage("COMMUNICATION_PLAN");
    if (savedPlan) {
      setFormData(savedPlan);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to storage
    saveToStorage("COMMUNICATION_PLAN", formData);
    
    // Log activity
    logActivity(
      "profile_updated",
      "Updated emergency communication plan",
      user?.accessToken
    );
    
    toast.success("Communication plan saved successfully");
    onClose();
    
    // Reload page to update Dashboard
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emergency Communication Plan</DialogTitle>
          <DialogDescription>
            Create a plan to stay connected with your family during emergencies
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meetingPoint">Family Meeting Point</Label>
            <Input
              id="meetingPoint"
              value={formData.meetingPoint}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingPoint: e.target.value }))}
              placeholder="e.g., Rizal Park, Luneta"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outOfTownContact">Out-of-Town Contact Name</Label>
            <Input
              id="outOfTownContact"
              value={formData.outOfTownContact}
              onChange={(e) => setFormData(prev => ({ ...prev, outOfTownContact: e.target.value }))}
              placeholder="Relative outside NCR"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyNumber">Emergency Contact Number</Label>
            <Input
              id="emergencyNumber"
              type="tel"
              value={formData.emergencyNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyNumber: e.target.value }))}
              placeholder="+63 XXX XXX XXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Special instructions, medical conditions, etc."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
