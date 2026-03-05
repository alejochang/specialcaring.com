
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Save, PlusCircle, Pencil, Trash2, Plus, Clock, Calendar as CalendarIcon, Pill, Loader2, AlertCircle
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

const createMedicationSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t('validation.medicationNameRequired')),
  dosage: z.string().min(1, t('validation.fieldRequired')),
  frequency: z.string().min(1, t('validation.fieldRequired')),
  purpose: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
  prescribedBy: z.string().optional(),
  pharmacy: z.string().optional(),
  refillDate: z.string().optional(),
  sideEffects: z.string().optional(),
});

type MedicationForm = z.infer<ReturnType<typeof createMedicationSchema>>;

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
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const medicationSchema = useMemo(() => createMedicationSchema(t), [t]);

  const form = useForm<MedicationForm>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { name: "", dosage: "", frequency: "", purpose: "", startDate: "", endDate: "", instructions: "", prescribedBy: "", pharmacy: "", refillDate: "", sideEffects: "" },
  });

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications', activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('child_id', activeChild!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as any as DbMedication[];
    },
    enabled: !!user && !!activeChild,
  });

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

  const saveMutation = useMutation({
    mutationFn: async (values: MedicationForm) => {
      if (!user || !activeChild) throw new Error('No user or child');
      const dbData = { ...formToDb(values), created_by: user.id, child_id: activeChild.id };
      if (editingId) {
        const { error } = await supabase.from('medications').update(dbData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('medications').insert([dbData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', activeChild?.id] });
      toast({ title: editingId ? t('sections.medications.toast.medicationUpdated') : t('sections.medications.toast.medicationAdded') });
      form.reset();
      setEditingId(null);
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => toast({ title: t('toast.error'), description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', activeChild?.id] });
      toast({ title: t('sections.medications.toast.medicationRemoved') });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({ title: t('toast.error'), description: error.message, variant: "destructive" });
      setDeletingId(null);
    },
  });

  const onSubmit = (values: MedicationForm) => saveMutation.mutate(values);

  const handleEdit = (med: DbMedication) => {
    form.reset(dbToForm(med));
    setEditingId(med.id);
    setIsAddDialogOpen(true);
  };

  const resetForm = () => { form.reset(); setEditingId(null); };

  const formatFrequency = (freq: string) => {
    return t(`sections.medications.frequencies.${freq}`, freq);
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">{t('sections.medications.title')}</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>{t('common.noChildProfile')}</AlertDescription></Alert>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold text-foreground">{t('sections.medications.title')}</h2>
            <p className="text-muted-foreground">{t('sections.medications.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canEdit && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-special-600 hover:bg-special-700 text-white px-6 py-3 text-base font-medium rounded-lg shadow-sm" onClick={resetForm}>
                  <Plus className="h-5 w-5 mr-2" />{t('sections.medications.addNew')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-2xl font-semibold">{editingId ? t('sections.medications.editMedication') : t('sections.medications.addNew')}</DialogTitle>
                  <p className="text-muted-foreground">{t('sections.medications.dialogDescription')}</p>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">{t('sections.medications.formSections.basicInfo')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.name')} *</FormLabel><FormControl><Input placeholder={t('sections.medications.placeholders.name')} className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="dosage" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.dosage')} *</FormLabel><FormControl><Input placeholder={t('sections.medications.placeholders.dosage')} className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="frequency" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.frequency')} *</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger className="h-11"><SelectValue placeholder={t('sections.medications.placeholders.frequency')} /></SelectTrigger><SelectContent><SelectItem value="once_daily">{t('sections.medications.frequencies.once_daily')}</SelectItem><SelectItem value="twice_daily">{t('sections.medications.frequencies.twice_daily')}</SelectItem><SelectItem value="three_times_daily">{t('sections.medications.frequencies.three_times_daily')}</SelectItem><SelectItem value="four_times_daily">{t('sections.medications.frequencies.four_times_daily')}</SelectItem><SelectItem value="every_morning">{t('sections.medications.frequencies.every_morning')}</SelectItem><SelectItem value="every_night">{t('sections.medications.frequencies.every_night')}</SelectItem><SelectItem value="as_needed">{t('sections.medications.frequencies.as_needed')}</SelectItem><SelectItem value="weekly">{t('sections.medications.frequencies.weekly')}</SelectItem><SelectItem value="monthly">{t('sections.medications.frequencies.monthly')}</SelectItem><SelectItem value="other">{t('sections.medications.frequencies.other')}</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="purpose" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.purpose')}</FormLabel><FormControl><Input placeholder={t('sections.medications.placeholders.purpose')} className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">{t('sections.medications.formSections.healthcareProvider')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="prescribedBy" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.prescriber')}</FormLabel><FormControl><Input placeholder={t('sections.medications.placeholders.prescriber')} className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="pharmacy" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.pharmacy')}</FormLabel><FormControl><Input placeholder={t('sections.medications.placeholders.pharmacy')} className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </div>
                    <div className="bg-green-50/50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">{t('sections.medications.formSections.scheduleDates')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.startDate')}</FormLabel><FormControl><Input type="date" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.endDate')}</FormLabel><FormControl><Input type="date" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="refillDate" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.refillDate')}</FormLabel><FormControl><Input type="date" className="h-11" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </div>
                    <div className="bg-amber-50/50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">{t('sections.medications.formSections.additionalInfo')}</h3>
                      <div className="space-y-6">
                        <FormField control={form.control} name="instructions" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.instructions')}</FormLabel><FormControl><Textarea placeholder={t('sections.medications.placeholders.instructions')} className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="sideEffects" render={({ field }) => (<FormItem><FormLabel>{t('sections.medications.fields.sideEffects')}</FormLabel><FormControl><Textarea placeholder={t('sections.medications.placeholders.sideEffects')} className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    </div>
                    <DialogFooter className="gap-3 pt-6">
                      <DialogClose asChild><Button type="button" variant="outline">{t('common.cancel')}</Button></DialogClose>
                      <Button type="submit" className="bg-special-600 hover:bg-special-700 text-white px-8">{editingId ? t('sections.medications.editMedication') : t('sections.medications.addNew')}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
          {medications.length > 0 && (
            <ExportEmailButtons exportFunctionName="export-medications" emailFunctionName="send-medications" exportFilename="medications-list.html" label="Medications List" />
          )}
        </div>
      </div>

      {medications.length > 0 ? (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-special-50 to-blue-50 border-b">
            <CardTitle className="text-xl font-semibold">{t('sections.medications.yourMedications')}</CardTitle>
            <CardDescription>{t('sections.medications.trackingCount', { count: medications.length })}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30">
                    <TableHead className="font-semibold py-4">{t('sections.medications.tableHeaders.medication')}</TableHead>
                    <TableHead className="font-semibold">{t('sections.medications.tableHeaders.dosage')}</TableHead>
                    <TableHead className="font-semibold">{t('sections.medications.tableHeaders.frequency')}</TableHead>
                    <TableHead className="font-semibold">{t('sections.medications.tableHeaders.purpose')}</TableHead>
                    <TableHead className="font-semibold">{t('sections.medications.tableHeaders.refillDate')}</TableHead>
                    {canEdit && <TableHead className="text-right font-semibold">{t('sections.medications.tableHeaders.actions')}</TableHead>}
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
                              {needsRefill && <Badge variant="destructive" className="text-xs">{t('sections.medications.refillSoon')}</Badge>}
                            </div>
                          ) : "-"}
                        </TableCell>
                        {canEdit && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(med)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingId(med.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        )}
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
              <h3 className="text-2xl font-semibold mb-3">{t('sections.medications.noMedications')}</h3>
              <p className="text-muted-foreground mb-8 text-lg">{t('sections.medications.noMedicationsDescFull')}</p>
              {canEdit && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-special-600 hover:bg-special-700 text-white px-8 py-3">
                  <Plus className="h-5 w-5 mr-2" />{t('sections.medications.addFirstMedication')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sections.medications.deleteMedication')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sections.medications.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deletingId) deleteMutation.mutate(deletingId); }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MedicationsList;
