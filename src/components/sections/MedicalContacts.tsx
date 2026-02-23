
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle, Pencil, Trash2, Plus, Phone, MapPin, AtSign, Star, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";


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

type ContactForm = z.infer<typeof contactSchema>;

interface DbContact {
  id: string;
  name: string;
  type: string;
  specialty: string | null;
  phone_number: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_primary: boolean;
}

const MedicalContacts = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", type: "", specialty: "", phoneNumber: "", email: "", address: "", notes: "", isPrimary: false },
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['medicalContacts', activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_contacts')
        .select('*')
        .eq('child_id', activeChild!.id)
        .order('is_primary', { ascending: false })
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as any as DbContact[];
    },
    enabled: !!user && !!activeChild,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ContactForm) => {
      if (!user || !activeChild) throw new Error('No user or child');
      const dbData = {
        created_by: user.id, child_id: activeChild.id,
        name: values.name, type: values.type, specialty: values.specialty || '',
        phone_number: values.phoneNumber, email: values.email || '',
        address: values.address || '', notes: values.notes || '', is_primary: values.isPrimary,
      };
      if (editingId) {
        const { error } = await supabase.from('medical_contacts').update(dbData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('medical_contacts').insert([dbData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalContacts', activeChild?.id] });
      toast({ title: editingId ? "Contact updated" : "Contact added" });
      form.reset();
      setEditingId(null);
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medical_contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalContacts', activeChild?.id] });
      toast({ title: "Contact removed" });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setDeletingId(null);
    },
  });

  const onSubmit = (values: ContactForm) => saveMutation.mutate(values);

  const handleEdit = (c: DbContact) => {
    form.reset({ name: c.name, type: c.type, specialty: c.specialty || "", phoneNumber: c.phone_number, email: c.email || "", address: c.address || "", notes: c.notes || "", isPrimary: c.is_primary });
    setEditingId(c.id);
    setIsAddDialogOpen(true);
  };

  const resetForm = () => { form.reset(); setEditingId(null); };

  const getInitials = (name: string) => name.split(' ').map(p => p.charAt(0)).join('').toUpperCase().substring(0, 2);

  const formatContactType = (type: string) => {
    const mapping: Record<string, string> = { primary_physician: "Primary Care Physician", specialist: "Specialist", pharmacy: "Pharmacy", hospital: "Hospital", emergency: "Emergency Contact", other: "Other" };
    return mapping[type] || type;
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Medical Contacts</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please select or create a child profile first.</AlertDescription></Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-special-600" /></div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Contacts</h2>
          <p className="text-muted-foreground">Manage healthcare providers and important medical contacts</p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-special-600 hover:bg-special-700 flex items-center gap-2" onClick={resetForm}>
                <Plus size={16} />Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Contact" : "Add New Contact"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name*</FormLabel><FormControl><Input placeholder="Dr. John Smith" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Type*</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="primary_physician">Primary Care Physician</SelectItem><SelectItem value="specialist">Specialist</SelectItem><SelectItem value="pharmacy">Pharmacy</SelectItem><SelectItem value="hospital">Hospital</SelectItem><SelectItem value="emergency">Emergency Contact</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="specialty" render={({ field }) => (<FormItem><FormLabel>Specialty</FormLabel><FormControl><Input placeholder="e.g., Cardiology" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number*</FormLabel><FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Medical Center Dr" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="isPrimary" render={({ field }) => (<FormItem className="flex flex-row items-center gap-2 space-y-0 mt-6"><FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 rounded border-gray-300" /></FormControl><FormLabel className="m-0">Primary Contact</FormLabel></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Additional notes" className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" className="bg-special-600 hover:bg-special-700">{editingId ? "Update Contact" : "Add Contact"}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow overflow-hidden bg-white">
              <CardHeader className="relative pb-2">
                {canEdit && (
                  <div className="absolute top-4 right-4 flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)} className="h-8 w-8"><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingId(contact.id)} className="h-8 w-8"><Trash2 size={14} /></Button>
                  </div>
                )}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarFallback className="bg-muted text-foreground">{getInitials(contact.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {contact.name}
                      {contact.is_primary && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      {formatContactType(contact.type)}
                      {contact.specialty && ` \u2022 ${contact.specialty}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-muted-foreground" /><span>{contact.phone_number}</span></div>
                  {contact.email && <div className="flex items-center gap-2 text-sm"><AtSign size={14} className="text-muted-foreground" /><span className="truncate">{contact.email}</span></div>}
                  {contact.address && <div className="flex items-start gap-2 text-sm"><MapPin size={14} className="text-muted-foreground mt-1 shrink-0" /><span>{contact.address}</span></div>}
                  {contact.notes && <div className="mt-4 pt-3 border-t border-border"><p className="text-sm text-muted-foreground">{contact.notes}</p></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border bg-white text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="bg-muted rounded-full p-3 mb-4"><PlusCircle size={32} className="text-muted-foreground" /></div>
              <h3 className="text-xl font-medium mb-2">No contacts added yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">Add your medical contacts for easy access to important healthcare providers.</p>
              {canEdit && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-special-600 hover:bg-special-700">Add Your First Contact</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this contact from your list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deletingId) deleteMutation.mutate(deletingId); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicalContacts;
