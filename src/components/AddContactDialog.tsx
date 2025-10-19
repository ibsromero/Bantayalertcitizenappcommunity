import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: any) => void;
}

export function AddContactDialog({ isOpen, onClose, onAdd }: AddContactDialogProps) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [type, setType] = useState("Personal Contact");
  const [isPrimary, setIsPrimary] = useState(false);

  const handleSave = () => {
    if (name && number) {
      onAdd({
        name,
        number,
        type,
        isPrimary,
      });
      
      // Reset form
      setName("");
      setNumber("");
      setType("Personal Contact");
      setIsPrimary(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Emergency Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your emergency contact list. Set as primary to make it your default emergency contact.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Phone Number</Label>
            <Input
              id="number"
              placeholder="+63 917 123 4567"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Contact Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Primary Contact">Primary Contact</SelectItem>
                <SelectItem value="Secondary Contact">Secondary Contact</SelectItem>
                <SelectItem value="Family Member">Family Member</SelectItem>
                <SelectItem value="Work Contact">Work Contact</SelectItem>
                <SelectItem value="Neighbor">Neighbor</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isPrimary" className="cursor-pointer">
              Set as primary contact
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !number}>
            Add Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
