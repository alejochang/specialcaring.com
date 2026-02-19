
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Briefcase, Plus, Pencil, Trash2, Loader2, DollarSign, Clock, FileText, AlertCircle } from "lucide-react";

/* ---------- Zod schema ---------- */
const agreementSchema = z.object({
  caregiver_name: z.string().min(1, "Caregiver name is required"),
  position_title: z.string().optional().default(""),
  start_date: z.string().optional().default(""),
  end_date: z.string().optional().default(""),
  work_schedule: z.string().optional().default(""),
  hourly_rate: z.string().optional().default(""),
  payment_frequency: z.string().optional().default(""),
  duties: z.string().optional().default(""),
  emergency_procedures: z.string().optional().default(""),
  confidentiality_terms: z.string().optional().default(""),
  termination_terms: z.string().optional().default(""),
  additional_terms: z.string().optional().default(""),
  status: z.string().min(1).default("active"),
});

type AgreementForm = z.infer<typeof agreementSchema>;

interface Agreement {
  id: string;
  caregiver_name: string;
  position_title: string;
  start_date: string;
  end_date: string;
  work_schedule: string;
  hourly_rate: string;
  payment_frequency: string;
  duties: string;
  emergency_procedures: string;
  confidentiality_terms: string;
  termination_terms: string;
  additional_terms: string;
  status: string;
}

const defaultValues: AgreementForm = {
  caregiver_name: "",
  position_title: "",
  start_date: "",
  end_date: "",
  work_schedule: "",
  hourly_rate: "",
  payment_frequency: "",
  duties: "",
  emergency_procedures: "",
  confidentiality_terms: "",
  termination_terms: "",
  additional_terms: "",
  status: "active",
};

const EmploymentAgreement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const form = useForm<AgreementForm>({
    resolver: zodResolver(agreementSchema),
    defaultValues,
  });

  /* ---------- Queries ---------- */
  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["employmentAgreements", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employment_agreements")
        .select("*")
        .eq("child_id", activeChild!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any as Agreement[];
    },
    enabled: !!user && !!activeChild,
  });

  /* ---------- Mutations ---------- */
  const saveMutation = useMutation({
    mutationFn: async (values: AgreementForm) => {
      if (!user || !activeChild) throw new Error("Invalid form data");
      const dbData = { ...values, user_id: user.id, child_id: activeChild.id };
      if (editingId) {
        const { error } = await supabase.from("employment_agreements").update(dbData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employment_agreements").insert([dbData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employmentAgreements", activeChild?.id] });
      toast({ title: editingId ? "Agreement updated" : "Agreement added" });
      setIsDialogOpen(false);
      setEditingId(null);
      form.reset(defaultValues);
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employment_agreements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employmentAgreements", activeChild?.id] });
      toast({ title: "Agreement removed" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  /* ---------- Handlers ---------- */
  const onSubmit = (values: AgreementForm) => {
    saveMutation.mutate(values);
  };

  const handleEdit = (a: Agreement) => {
    form.reset({
      caregiver_name: a.caregiver_name,
      position_title: a.position_title,
      start_date: a.start_date,
      end_date: a.end_date,
      work_schedule: a.work_schedule,
      hourly_rate: a.hourly_rate,
      payment_frequency: a.payment_frequency,
      duties: a.duties,
      emergency_procedures: a.emergency_procedures,
      confidentiality_terms: a.confidentiality_terms,
      termination_terms: a.termination_terms,
      additional_terms: a.additional_terms,
      status: a.status,
    });
    setEditingId(a.id);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
      setDeletingId(null);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  /* ---------- Guards ---------- */
  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Employment Agreements</h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please select or create a child profile first.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-special-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-special-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Employment Agreements</h2>
            <p className="text-muted-foreground">Manage caregiver employment details and contracts</p>
          </div>
        </div>
        {canEdit && (
          <Button
            className="bg-special-600 hover:bg-special-700"
            onClick={() => {
              form.reset(defaultValues);
              setEditingId(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Agreement
          </Button>
        )}
      </div>

      {agreements.length > 0 ? (
        <div className="grid gap-4">
          {agreements.map((a) => (
            <Card key={a.id} className="bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{a.caregiver_name}</CardTitle>
                    <CardDescription>{a.position_title}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(a.status)}>{a.status}</Badge>
                    {canEdit && (
                      <>
                        <Button variant="outline" size="icon" onClick={() => handleEdit(a)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setDeletingId(a.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {a.work_schedule && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{a.work_schedule}</span>
                    </div>
                  )}
                  {a.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {a.hourly_rate} ({a.payment_frequency || "N/A"})
                      </span>
                    </div>
                  )}
                  {a.start_date && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {a.start_date}
                        {a.end_date ? ` - ${a.end_date}` : " - Present"}
                      </span>
                    </div>
                  )}
                </div>
                {a.duties && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-1">Duties</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{a.duties}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 bg-white">
          <CardContent>
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Employment Agreements</h3>
            <p className="text-muted-foreground mb-4">Add employment agreements for caregivers.</p>
            {canEdit && (
              <Button
                onClick={() => {
                  form.reset(defaultValues);
                  setEditingId(null);
                  setIsDialogOpen(true);
                }}
                className="bg-special-600 hover:bg-special-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Agreement
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---------- Form Dialog ---------- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Agreement" : "New Employment Agreement"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caregiver_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caregiver Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="work_schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Schedule</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mon-Fri 8AM-5PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $25/hr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Frequency</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="duties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duties & Responsibilities</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergency_procedures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Procedures</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confidentiality_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidentiality Terms</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termination_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termination Terms</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additional_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Terms</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-special-600 hover:bg-special-700">
                  {editingId ? "Update" : "Create"} Agreement
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---------- Delete Confirmation AlertDialog ---------- */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employment Agreement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this employment agreement. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmploymentAgreement;
