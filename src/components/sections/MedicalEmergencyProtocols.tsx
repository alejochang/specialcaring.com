
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, PlusCircle, Pencil, AlertTriangle, Phone, Clock, FileText, Trash2, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";

const protocolSchema = z.object({
  title: z.string().min(1, "Title is required"),
  severity: z.enum(["critical", "urgent", "moderate"]),
  emergencyContacts: z.string().min(1, "Emergency contacts are required"),
  immediateSteps: z.string().min(1, "Immediate steps are required"),
  whenToCall911: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type ProtocolValues = z.infer<typeof protocolSchema>;

interface Protocol extends ProtocolValues {
  id: string;
}

const MedicalEmergencyProtocols = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const form = useForm<ProtocolValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: { title: "", severity: "moderate", emergencyContacts: "", immediateSteps: "", whenToCall911: "", additionalNotes: "" },
  });

  const { data: protocols = [], isLoading } = useQuery({
    queryKey: ['emergencyProtocols', activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_protocols')
        .select('*')
        .eq('child_id', activeChild!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id, title: d.title, severity: d.severity as any,
        emergencyContacts: d.emergency_contacts, immediateSteps: d.immediate_steps,
        whenToCall911: d.when_to_call_911 || '', additionalNotes: d.additional_notes || '',
      })) as Protocol[];
    },
    enabled: !!user && !!activeChild,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ProtocolValues) => {
      if (!user || !activeChild) throw new Error('No user or child');
      const dbData = {
        user_id: user.id, child_id: activeChild.id, title: values.title, severity: values.severity,
        emergency_contacts: values.emergencyContacts, immediate_steps: values.immediateSteps,
        when_to_call_911: values.whenToCall911 || '', additional_notes: values.additionalNotes || '',
      };
      if (editingId) {
        const { error } = await supabase.from('emergency_protocols').update(dbData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('emergency_protocols').insert([dbData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyProtocols', activeChild?.id] });
      toast({ title: editingId ? "Protocol updated" : "Protocol added" });
      setIsEditing(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('emergency_protocols').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyProtocols', activeChild?.id] });
      toast({ title: "Protocol deleted" });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setDeletingId(null);
    },
  });

  const onSubmit = (values: ProtocolValues) => saveMutation.mutate(values);

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id);
    form.reset(protocol);
    setIsEditing(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-200 bg-red-50";
      case "urgent": return "border-orange-200 bg-orange-50";
      case "moderate": return "border-yellow-200 bg-yellow-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "urgent": return <Clock className="h-5 w-5 text-orange-600" />;
      case "moderate": return <FileText className="h-5 w-5 text-yellow-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Medical Emergency Protocols</h2>
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
          <h2 className="text-2xl font-bold">Medical Emergency Protocols</h2>
          <p className="text-muted-foreground">Quick reference guides for managing medical emergencies</p>
        </div>
        {canEdit && (
          <Button onClick={() => { setEditingId(null); form.reset(); setIsEditing(true); }} className="bg-special-600 hover:bg-special-700 flex items-center gap-2">
            <PlusCircle size={16} />Add Protocol
          </Button>
        )}
      </div>

      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Emergency Reminder</AlertTitle>
        <AlertDescription className="text-red-700">
          In a life-threatening emergency, always call 911 first. These protocols are supplementary guidance.
        </AlertDescription>
      </Alert>

      {protocols.length > 0 ? (
        <div className="grid gap-4 mb-6">
          {protocols.map((protocol) => (
            <Card key={protocol.id} className={`${getSeverityColor(protocol.severity)} border-2`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(protocol.severity)}
                    <div><CardTitle className="text-xl">{protocol.title}</CardTitle><CardDescription className="capitalize">{protocol.severity} Priority</CardDescription></div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(protocol)}><Pencil size={16} /></Button>
                      <Button variant="outline" size="sm" onClick={() => setDeletingId(protocol.id)}><Trash2 size={16} /></Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2"><Phone className="h-4 w-4 text-special-600" /><h4 className="font-medium">Emergency Contacts</h4></div>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded-md">{protocol.emergencyContacts}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-special-600" /><h4 className="font-medium">Immediate Steps</h4></div>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded-md whitespace-pre-line">{protocol.immediateSteps}</div>
                </div>
                {protocol.whenToCall911 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2"><Phone className="h-4 w-4 text-red-600" /><h4 className="font-medium text-red-700">When to Call 911</h4></div>
                    <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md whitespace-pre-line border border-red-200">{protocol.whenToCall911}</div>
                  </div>
                )}
                {protocol.additionalNotes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-special-600" /><h4 className="font-medium">Additional Notes</h4></div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{protocol.additionalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Emergency Protocols Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first emergency protocol to be prepared for critical situations.</p>
            {canEdit && (
              <Button onClick={() => setIsEditing(true)} className="bg-special-600 hover:bg-special-700"><PlusCircle size={16} className="mr-2" />Add Your First Protocol</Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Emergency Protocol" : "Add New Emergency Protocol"}</DialogTitle>
            <DialogDescription>Create detailed step-by-step instructions for handling medical emergencies.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Protocol Title</FormLabel><FormControl><Input placeholder="e.g., Seizure Response" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="severity" render={({ field }) => (<FormItem><FormLabel>Severity Level</FormLabel><FormControl><select {...field} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"><option value="moderate">Moderate Priority</option><option value="urgent">Urgent Priority</option><option value="critical">Critical Priority</option></select></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="emergencyContacts" render={({ field }) => (<FormItem><FormLabel>Emergency Contacts</FormLabel><FormControl><Textarea placeholder="List emergency contacts..." className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="immediateSteps" render={({ field }) => (<FormItem><FormLabel>Immediate Steps to Take</FormLabel><FormControl><Textarea placeholder="List step-by-step instructions..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="whenToCall911" render={({ field }) => (<FormItem><FormLabel>When to Call 911 (Optional)</FormLabel><FormControl><Textarea placeholder="Specify conditions..." className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="additionalNotes" render={({ field }) => (<FormItem><FormLabel>Additional Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Any additional information..." className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingId(null); form.reset(); }}>Cancel</Button>
                <Button type="submit" className="bg-special-600 hover:bg-special-700 flex items-center gap-2"><Save size={16} />{editingId ? "Update Protocol" : "Save Protocol"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Protocol?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this emergency protocol. This action cannot be undone.
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

export default MedicalEmergencyProtocols;
