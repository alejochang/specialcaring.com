
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Save, PlusCircle, Pencil, Trash2, Plus, Clock, Calendar as CalendarIcon, Pill, Loader2
} from "lucide-react";
import ExportEmailButtons from "@/components/shared/ExportEmailButtons";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  purpose: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
  prescribedBy: z.string().optional(),
  pharmacy: z.string().optional(),
  refillDate: z.string().optional(),
  sideEffects: z.string().optional(),
});

type MedicationForm = z.infer<typeof medicationSchema>;

interface DbMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  purpose: string | null;
  start_date: string | null;
  end_date: string | null;
  instructions: string | null;
  prescriber: string | null;
  pharmacy: string | null;
  refill_date: string | null;
  side_effects: string | null;
}

const MedicationsList = () => {
  const [medications, setMedications] = useState<DbMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeChild } = useChild();

  const form = useForm<MedicationForm>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { name: "", dosage: "", frequency: "", purpose: "", startDate: "", endDate: "", instructions: "", prescribedBy: "", pharmacy: "", refillDate: "", sideEffects: "" },
  });

  useEffect(() => {
    if (user && activeChild) fetchMedications();
  }, [user, activeChild?.id]);

  const fetchMedications = async () => {
    if (!user || !activeChild) return;
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('child_id', activeChild.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMedications((data || []) as any as DbMedication[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const dbToForm = (d: DbMedication): MedicationForm => ({
    name: d.name, dosage: d.dosage, frequency: d.frequency,
    purpose: d.purpose || "", startDate: d.start_date || "", endDate: d.end_date || "",
    instructions: d.instructions || "", prescribedBy: d.prescriber || "",
    pharmacy: d.pharmacy || "", refillDate: d.refill_date || "", sideEffects: d.side_effects || "",
  });

  const formToDb = (v: MedicationForm) => ({
    name: v.name, dosage: v.dosage, frequency: v.frequency,
    purpose: v.purpose || '', start_date: v.startDate || '', end_date: v.endDate || '',
    instructions: v.instructions || '', prescriber: v.prescribedBy || '',
    pharmacy: v.pharmacy || '', refill_date: v.refillDate || '', side_effects: v.sideEffects || '',
  });

  const onSubmit = async (values: MedicationForm) => {
    if (!user || !activeChild) return;
    try {
      const dbData = { ...formToDb(values), user_id: user.id, child_id: activeChild.id };
      if (editingId) {
        const { error } = await supabase.from('medications').update(dbData).eq('id', editingId);
        if (error) throw error;
        toast({ title: "Medication updated" });
      } else {
        const { error } = await supabase.from('medications').insert([dbData]);
        if (error) throw error;
        toast({ title: "Medication added" });
      }
      form.reset();
      setEditingId(null);
      setIsAddDialogOpen(false);
      fetchMedications();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (med: DbMedication) => {
    form.reset(dbToForm(med));
    setEditingId(med.id);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw error;
      setMedications(prev => prev.filter(m => m.id !== id));
      toast({ title: "Medication removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => { form.reset(); setEditingId(null); };

  const formatFrequency = (freq: string) => {
    const mapping: Record<string, string> = {
      once_daily: "Once Daily", twice_daily: "Twice Daily", three_times_daily: "Three Times Daily",
      four_times_daily: "Four Times Daily", every_morning: "Every Morning", every_night: "Every Night",
      as_needed: "As Needed", weekly: "Weekly", monthly: "Monthly", other: "Custom Schedule",
    };
    return mapping[freq] || freq;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-special-600" /></div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center">
            <Pill className="h-6 w-6 text-special-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Medications</h2>
            <p className="text-muted-foreground">Manage prescribed medications and schedules</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-special-600 hover:bg-special-700 text-white px-6 py-3 text-base font-medium rounded-lg shadow-sm" onClick={resetForm}>
                <Plus className="h-5 w-5 mr-2" />Add New Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-semibold">{editingId ? "Edit Medication" : "Add New Medication"}</DialogTitle>
                <p className="text-muted-foreground">Fill in the medication details below.</p>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Medication Name *</FormLabel><FormControl><Input placeholder="e.g., Lisinopril" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="dosage" render={({ field }) => (<FormItem><FormLabel>Dosage *</FormLabel><FormControl><Input placeholder="e.g., 10mg" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="frequency" render={({ field }) => (<FormItem><FormLabel>How Often *</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="h-11"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="once_daily">Once Daily</SelectItem><SelectItem value="twice_daily">Twice Daily</SelectItem><SelectItem value="three_times_daily">Three Times Daily</SelectItem><SelectItem value="four_times_daily">Four Times Daily</SelectItem><SelectItem value="every_morning">Every Morning</SelectItem><SelectItem value="every_night">Every Night</SelectItem><SelectItem value="as_needed">As Needed</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="purpose" render={({ field }) => (<FormItem><FormLabel>Purpose</FormLabel><FormControl><Input placeholder="e.g., Blood pressure" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                  <div className="bg-blue-50/50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Healthcare Provider</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="prescribedBy" render={({ field }) => (<FormItem><FormLabel>Prescribed By</FormLabel><FormControl><Input placeholder="e.g., Dr. Smith" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="pharmacy" render={({ field }) => (<FormItem><FormLabel>Pharmacy</FormLabel><FormControl><Input placeholder="e.g., CVS Pharmacy" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                  <div className="bg-green-50/50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Schedule & Dates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="refillDate" render={({ field }) => (<FormItem><FormLabel>Next Refill Date</FormLabel><FormControl><Input type="date" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                  <div className="bg-amber-50/50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                    <div className="space-y-6">
                      <FormField control={form.control} name="instructions" render={({ field }) => (<FormItem><FormLabel>Special Instructions</FormLabel><FormControl><Textarea placeholder="e.g., Take with food" className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="sideEffects" render={({ field }) => (<FormItem><FormLabel>Known Side Effects</FormLabel><FormControl><Textarea placeholder="List any known side effects" className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                  <DialogFooter className="gap-3 pt-6">
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" className="bg-special-600 hover:bg-special-700 text-white px-8">{editingId ? "Update Medication" : "Add Medication"}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          {medications.length > 0 && (
            <ExportEmailButtons exportFunctionName="export-medications" emailFunctionName="send-medications" exportFilename="medications-list.html" label="Medications List" />
          )}
        </div>
      </div>

      {medications.length > 0 ? (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-special-50 to-blue-50 border-b">
            <CardTitle className="text-xl font-semibold">Your Medications</CardTitle>
            <CardDescription>Currently tracking {medications.length} medication{medications.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30">
                    <TableHead className="font-semibold py-4">Medication</TableHead>
                    <TableHead className="font-semibold">Dosage</TableHead>
                    <TableHead className="font-semibold">Frequency</TableHead>
                    <TableHead className="font-semibold">Purpose</TableHead>
                    <TableHead className="font-semibold">Refill Date</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((med) => {
                    const needsRefill = med.refill_date && new Date(med.refill_date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
                    return (
                      <TableRow key={med.id} className="border-b hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium py-4">{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{formatFrequency(med.frequency)}</TableCell>
                        <TableCell>{med.purpose || "-"}</TableCell>
                        <TableCell>
                          {med.refill_date ? (
                            <div className="flex items-center gap-2">
                              <span>{new Date(med.refill_date).toLocaleDateString()}</span>
                              {needsRefill && <Badge variant="destructive" className="text-xs">Refill Soon</Badge>}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(med)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(med.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 bg-white text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="bg-special-50 rounded-full p-6 mb-6"><Pill className="h-12 w-12 text-special-600" /></div>
              <h3 className="text-2xl font-semibold mb-3">No medications added yet</h3>
              <p className="text-muted-foreground mb-8 text-lg">Keep track of all medications, dosages, and schedules in one organized place.</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-special-600 hover:bg-special-700 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />Add Your First Medication
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationsList;
