
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Save, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Plus, 
  Phone,
  MapPin,
  AtSign,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string().min(1, "Contact type is required"),
  specialty: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.string().length(0)),
  address: z.string().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

type Contact = z.infer<typeof contactSchema>;

const MedicalContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<Contact>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      type: "",
      specialty: "",
      phoneNumber: "",
      email: "",
      address: "",
      notes: "",
      isPrimary: false,
    },
  });

  const onSubmit = (values: Contact) => {
    if (editingIndex !== null) {
      // Update existing contact
      const updatedContacts = [...contacts];
      updatedContacts[editingIndex] = values;
      setContacts(updatedContacts);
      
      toast({
        title: "Contact updated",
        description: `${values.name} has been successfully updated.`,
      });
    } else {
      // Add new contact
      setContacts([...contacts, values]);
      
      toast({
        title: "Contact added",
        description: `${values.name} has been successfully added to your contacts.`,
      });
    }
    
    // Reset form and close dialog
    form.reset();
    setEditingIndex(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (index: number) => {
    const contact = contacts[index];
    form.reset(contact);
    setEditingIndex(index);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
    
    toast({
      title: "Contact removed",
      description: "The contact has been removed from your list.",
    });
  };

  const resetForm = () => {
    form.reset();
    setEditingIndex(null);
  };

  // Get initials from name for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Contacts</h2>
          <p className="text-muted-foreground">
            Manage healthcare providers and important medical contacts
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-caregiver-600 hover:bg-caregiver-700 flex items-center gap-2"
              onClick={resetForm}
            >
              <Plus size={16} />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type*</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select contact type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary_physician">Primary Care Physician</SelectItem>
                              <SelectItem value="specialist">Specialist</SelectItem>
                              <SelectItem value="pharmacy">Pharmacy</SelectItem>
                              <SelectItem value="hospital">Hospital</SelectItem>
                              <SelectItem value="emergency">Emergency Contact</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialty</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cardiology, Neurology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Medical Center Dr, City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPrimary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0 mt-6">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 text-caregiver-600 rounded border-gray-300 focus:ring-caregiver-500"
                          />
                        </FormControl>
                        <FormLabel className="m-0">Primary Contact</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this contact" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-caregiver-600 hover:bg-caregiver-700">
                    {editingIndex !== null ? "Update Contact" : "Add Contact"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, index) => {
            // Format contact type for display
            const formatContactType = (type: string) => {
              const mapping: Record<string, string> = {
                primary_physician: "Primary Care Physician",
                specialist: "Specialist",
                pharmacy: "Pharmacy",
                hospital: "Hospital",
                emergency: "Emergency Contact",
                other: "Other",
              };
              return mapping[type] || type;
            };
            
            return (
              <Card key={index} className="hover-card overflow-hidden bg-white">
                <CardHeader className="relative pb-2">
                  <div className="absolute top-4 right-4 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(index)}
                      className="h-8 w-8"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarFallback className="bg-muted text-foreground">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {contact.name}
                        {contact.isPrimary && (
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        {formatContactType(contact.type)}
                        {contact.specialty && ` • ${contact.specialty}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-muted-foreground" />
                      <span>{contact.phoneNumber}</span>
                    </div>
                    
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <AtSign size={14} className="text-muted-foreground" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    
                    {contact.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin size={14} className="text-muted-foreground mt-1 shrink-0" />
                        <span className="break-words">{contact.address}</span>
                      </div>
                    )}
                    
                    {contact.notes && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          {contact.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-sm border border-border bg-white text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="bg-muted rounded-full p-3 mb-4">
                <PlusCircle size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No contacts added yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Add your medical contacts for easy access to important healthcare providers.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-caregiver-600 hover:bg-caregiver-700"
              >
                Add Your First Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalContacts;
