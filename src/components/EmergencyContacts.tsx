import { useState, useEffect } from "react";
import { Phone, Plus, Edit2, Star, MessageSquare, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "./ui/alert-dialog";
import { EditContactDialog } from "./EditContactDialog";
import { AddContactDialog } from "./AddContactDialog";
import { makePhoneCall, sendSMS } from "../utils/phoneUtils";
import { saveToStorage, getFromStorage } from "../utils/storageUtils";
import { logActivity } from "../utils/activityUtils";
import { supabase } from "../utils/supabaseClient";
import { 
  getEmergencyContacts, 
  addEmergencyContact, 
  updateEmergencyContact, 
  deleteEmergencyContact 
} from "../utils/supabaseDataService";

interface EmergencyContactsProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function EmergencyContacts({ user }: EmergencyContactsProps) {
  const [editingContact, setEditingContact] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const emergencyServices = [
    { name: "National Emergency Hotline", number: "911", type: "Emergency", isPrimary: true },
    { name: "Philippine Red Cross", number: "143", type: "Emergency", isPrimary: false },
    { name: "PNP Emergency", number: "(02) 8722-0650", type: "Emergency", isPrimary: false },
    { name: "Bureau of Fire Protection", number: "(02) 8426-0219", type: "Emergency", isPrimary: false },
  ];

  const [personalContacts, setPersonalContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts from Supabase on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        // Only call Supabase if user has an access token
        if (user?.accessToken) {
          const { data: { user: currentUser } } = await supabase.auth.getUser(user.accessToken);
          
          if (currentUser) {
            const contacts = await getEmergencyContacts(currentUser.id);
            
            const formattedContacts = contacts.map(c => ({
              id: c.id,
              name: c.name,
              number: c.phone_number,
              type: c.contact_type,
              isPrimary: c.is_primary
            }));
            
            setPersonalContacts(formattedContacts);
            saveToStorage("CONTACTS", formattedContacts);
          }
        } else {
          // Load from localStorage if not logged in or in demo mode
          const saved = getFromStorage<any[]>("CONTACTS");
          if (saved) {
            setPersonalContacts(saved);
          }
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
        // Fallback to localStorage
        const saved = getFromStorage<any[]>("CONTACTS");
        if (saved) {
          setPersonalContacts(saved);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, [user]);

  const handleCall = (name: string, number: string) => {
    try {
      makePhoneCall(number, name);
      toast.success(`Calling ${name}`, {
        description: number,
      });
      
      logActivity("contact_called", `Called ${name}`, user?.accessToken);
    } catch (error) {
      toast.error("Failed to make call", {
        description: "Please check the phone number and try again",
      });
    }
  };

  const handleSMS = (name: string, number: string) => {
    try {
      sendSMS(number, "");
      toast.success(`Opening SMS to ${name}`, {
        description: number,
      });
      
      logActivity("contact_texted", `Sent SMS to ${name}`, user?.accessToken);
    } catch (error) {
      toast.error("Failed to send SMS", {
        description: "Please check the phone number and try again",
      });
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setShowEditDialog(true);
  };

  const handleDelete = (contact: any) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      // Only call Supabase if user has an access token
      if (user?.accessToken) {
        const { data: { user: currentUser } } = await supabase.auth.getUser(user.accessToken);
        
        if (currentUser && contactToDelete.id) {
          await deleteEmergencyContact(contactToDelete.id);
        }
      }
      
      setPersonalContacts(prev => {
        const updated = prev.filter(c => 
          contactToDelete.id ? c.id !== contactToDelete.id : c.name !== contactToDelete.name
        );
        saveToStorage("CONTACTS", updated);
        return updated;
      });
      
      toast.success("Contact removed", {
        description: `${contactToDelete.name} has been removed from your contacts`,
      });
      
      logActivity("contact_deleted", `Removed contact: ${contactToDelete.name}`, user?.accessToken);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error("Failed to remove contact");
    } finally {
      setShowDeleteDialog(false);
      setContactToDelete(null);
    }
  };

  const handleSaveContact = async (updatedContact: any) => {
    try {
      // Only call Supabase if user has an access token
      if (user?.accessToken) {
        const { data: { user: currentUser } } = await supabase.auth.getUser(user.accessToken);
        
        if (currentUser && editingContact.id) {
          await updateEmergencyContact(editingContact.id, {
            name: updatedContact.name,
            phone_number: updatedContact.number,
            contact_type: updatedContact.type,
            is_primary: updatedContact.isPrimary
          });
        }
      }
      
      setPersonalContacts(prev => {
        const updated = prev.map(c => (c.id === editingContact.id ? { ...updatedContact, id: editingContact.id } : c));
        saveToStorage("CONTACTS", updated);
        return updated;
      });
      
      logActivity("contact_edited", `Updated contact: ${updatedContact.name}`, user?.accessToken);
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error("Failed to update contact");
    }
  };

  const handleAddContact = () => {
    setShowAddDialog(true);
  };

  const handleAddNewContact = async (newContact: any) => {
    try {
      let contactToAdd = newContact;
      
      // Only call Supabase if user has an access token
      if (user?.accessToken) {
        const { data: { user: currentUser } } = await supabase.auth.getUser(user.accessToken);
        
        if (currentUser) {
          const addedContact = await addEmergencyContact(currentUser.id, {
            name: newContact.name,
            phone_number: newContact.number,
            contact_type: newContact.type,
            is_primary: newContact.isPrimary
          });
          
          contactToAdd = {
            id: addedContact.id,
            name: addedContact.name,
            number: addedContact.phone_number,
            type: addedContact.contact_type,
            isPrimary: addedContact.is_primary
          };
        }
      } else {
        // Generate a temporary ID for demo mode
        contactToAdd = { ...newContact, id: `temp-${Date.now()}` };
      }
      
      setPersonalContacts(prev => {
        const updated = [...prev, contactToAdd];
        saveToStorage("CONTACTS", updated);
        return updated;
      });
      
      toast.success("Contact added", {
        description: `${newContact.name} added to emergency contacts`,
      });
      
      logActivity("contact_added", `Added new contact: ${newContact.name}`, user?.accessToken);
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error("Failed to add contact");
    }
  };

  const handleCallPrimary = () => {
    const primaryContact = personalContacts.find(c => c.isPrimary);
    if (primaryContact) {
      handleCall(primaryContact.name, primaryContact.number);
    } else {
      toast.error("No primary contact set");
    }
  };

  const ContactCard = ({ name, number, type, isPrimary, isEmergencyService }: any) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{name}</h3>
              {isPrimary && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            </div>
            <p className="text-sm text-gray-600">{number}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {type}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="touch-manipulation min-h-[40px] min-w-[40px] active:scale-95 transition-transform"
              onClick={() => handleCall(name, number)}
              title="Call"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="touch-manipulation min-h-[40px] min-w-[40px] active:scale-95 transition-transform"
              onClick={() => handleSMS(name, number)}
              title="Send SMS"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            {!isEmergencyService && (
              <>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="touch-manipulation min-h-[40px] min-w-[40px] active:scale-95 transition-transform"
                  onClick={() => handleEdit({ name, number, type, isPrimary })}
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="touch-manipulation min-h-[40px] min-w-[40px] active:scale-95 transition-transform text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete({ name, number, type, isPrimary })}
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Emergency Contacts</h1>
        <Button 
          size="sm" 
          className="touch-manipulation min-h-[40px] active:scale-95 transition-transform"
          onClick={handleAddContact}
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Contact</span>
        </Button>
      </div>

      {/* Emergency Services */}
      <div>
        <h2 className="font-semibold mb-3 text-red-700">Emergency Services</h2>
        {emergencyServices.map((contact, index) => (
          <ContactCard key={index} {...contact} isEmergencyService={true} />
        ))}
      </div>

      {/* Personal Contacts */}
      <div>
        <h2 className="font-semibold mb-3">Personal Contacts</h2>
        {personalContacts.length > 0 ? (
          personalContacts.map((contact, index) => (
            <ContactCard key={index} {...contact} isEmergencyService={false} />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No personal contacts yet</p>
              <p className="text-sm text-gray-400 mt-1">Add contacts for quick access during emergencies</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start border-blue-300 touch-manipulation min-h-[44px] active:scale-95 transition-transform"
              onClick={handleCallPrimary}
            >
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Call Primary Contact</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditContactDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      <AddContactDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddNewContact}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {contactToDelete?.name} from your emergency contacts? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remove Contact
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
