
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";
import { DollarSign, Plus, Pencil, Trash2, Loader2, FileText, Building, Phone, AlertCircle } from "lucide-react";

interface FinDoc {
  id: string;
  doc_type: string;
  title: string;
  description: string;
  institution: string;
  account_number: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  expiry_date: string;
  notes: string;
  status: string;
}

const docSchema = z.object({
  doc_type: z.string().min(1, "Document type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  institution: z.string().optional(),
  account_number: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.string().length(0)),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().min(1),
});

type DocFormValues = z.infer<typeof docSchema>;

const docTypes = [
  { value: 'insurance', label: 'Insurance Policy' },
  { value: 'trust', label: 'Trust Fund' },
  { value: 'guardianship', label: 'Guardianship Document' },
  { value: 'power_of_attorney', label: 'Power of Attorney' },
  { value: 'disability_benefits', label: 'Disability Benefits' },
  { value: 'tax', label: 'Tax Document' },
  { value: 'bank', label: 'Bank Account' },
  { value: 'other', label: 'Other' },
];

const FinancialLegal = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEdit } = useUserRole();

  const form = useForm<DocFormValues>({
    resolver: zodResolver(docSchema),
    defaultValues: {
      doc_type: 'other', title: '', description: '', institution: '', account_number: '',
      contact_name: '', contact_phone: '', contact_email: '', expiry_date: '', notes: '', status: 'active',
    },
  });

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['financialLegalDocs', activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_legal_docs_secure')
        .select('*')
        .eq('child_id', activeChild!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as any as FinDoc[];
    },
    enabled: !!user && !!activeChild,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ formData, id }: { formData: DocFormValues; id: string | null }) => {
      const dbData = {
        doc_type: formData.doc_type, title: formData.title, description: formData.description || '',
        institution: formData.institution || '', account_number: formData.account_number || '',
        contact_name: formData.contact_name || '', contact_phone: formData.contact_phone || '',
        contact_email: formData.contact_email || '', expiry_date: formData.expiry_date || '',
        notes: formData.notes || '', status: formData.status,
        user_id: user!.id, child_id: activeChild!.id,
      };
      if (id) {
        const { error } = await supabase.from('financial_legal_docs').update(dbData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('financial_legal_docs').insert([dbData]);
        if (error) throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['financialLegalDocs', activeChild?.id] });
      toast({ title: id ? "Document updated" : "Document added" });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_legal_docs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialLegalDocs', activeChild?.id] });
      toast({ title: "Document removed" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const onSubmit = (values: DocFormValues) => {
    if (!user || !activeChild) return;
    saveMutation.mutate({ formData: values, id: editingId });
  };

  const handleEdit = (d: FinDoc) => {
    form.reset({
      doc_type: d.doc_type, title: d.title, description: d.description, institution: d.institution,
      account_number: d.account_number, contact_name: d.contact_name, contact_phone: d.contact_phone,
      contact_email: d.contact_email, expiry_date: d.expiry_date, notes: d.notes, status: d.status,
    });
    setEditingId(d.id);
    setIsDialogOpen(true);
  };

  const statusColor = (s: string) => {
    switch (s) { case 'active': return 'bg-green-100 text-green-800'; case 'pending': return 'bg-yellow-100 text-yellow-800'; case 'expired': return 'bg-red-100 text-red-800'; case 'archived': return 'bg-muted text-muted-foreground'; default: return ''; }
  };

  const getDocTypeLabel = (t: string) => docTypes.find(d => d.value === t)?.label || t;

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Financial & Legal</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please select or create a child profile first.</AlertDescription></Alert>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-special-600" /></div>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center"><DollarSign className="h-6 w-6 text-special-600" /></div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Financial & Legal</h2>
            <p className="text-muted-foreground">Important financial and legal documents</p>
          </div>
        </div>
        {canEdit && (
          <Button className="bg-special-600 hover:bg-special-700" onClick={() => { form.reset(); setEditingId(null); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Add Document
          </Button>
        )}
      </div>

      {docs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map(d => (
            <Card key={d.id} className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">{getDocTypeLabel(d.doc_type)}</Badge>
                    <CardTitle className="text-lg">{d.title}</CardTitle>
                    {d.description && <CardDescription>{d.description}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(d.status)}>{d.status}</Badge>
                    {canEdit && (
                      <>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(d)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDeletingId(d.id)}><Trash2 className="h-3 w-3" /></Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {d.institution && <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" />{d.institution}</div>}
                  {d.contact_phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{d.contact_phone}</div>}
                  {d.expiry_date && <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Expires: {d.expiry_date}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-white">
          <CardContent>
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-4">Add important financial and legal documents for safe keeping.</p>
            {canEdit && (
              <Button onClick={() => setIsDialogOpen(true)} className="bg-special-600 hover:bg-special-700"><Plus className="h-4 w-4 mr-2" />Add First Document</Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Document" : "Add Financial/Legal Document"}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="doc_type" render={({ field }) => (
                  <FormItem><FormLabel>Document Type</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{docTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="institution" render={({ field }) => (
                  <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="account_number" render={({ field }) => (
                  <FormItem><FormLabel>Account/Policy Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contact_name" render={({ field }) => (
                  <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contact_phone" render={({ field }) => (
                  <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="contact_email" render={({ field }) => (
                  <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="expiry_date" render={({ field }) => (
                  <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-special-600 hover:bg-special-700">{editingId ? "Update" : "Add"} Document</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The document will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deletingId) { deleteMutation.mutate(deletingId); setDeletingId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FinancialLegal;
