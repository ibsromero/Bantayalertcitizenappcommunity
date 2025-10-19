import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";

interface EditContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    name: string;
    number: string;
    type: string;
    isPrimary: boolean;
  } | null;
  onSave: (contact: any) => void;
}

export function EditContactDialog({ isOpen, onClose, contact, onSave }: EditContactDialogProps) {
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    number: contact?.number || "",
    type: contact?.type || "Emergency Contact",
    isPrimary: contact?.isPrimary || false,
  });

  // Update form data when contact prop changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        number: contact.number,
        type: contact.type,
        isPrimary: contact.isPrimary,
      });
    }
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast.success("Contact updated successfully");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact information for emergency situations
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter contact name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Phone Number</Label>
            <Input
              id="number"
              type="tel"
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              placeholder="+63 XXX XXX XXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Contact Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary Contact">Primary Contact</SelectItem>
                <SelectItem value="Secondary Contact">Secondary Contact</SelectItem>
                <SelectItem value="Family Member">Family Member</SelectItem>
                <SelectItem value="Work Contact">Work Contact</SelectItem>
                <SelectItem value="Neighbor">Neighbor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
