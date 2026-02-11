
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { Briefcase, Plus, Pencil, Trash2, Loader2, DollarSign, Clock, FileText } from "lucide-react";

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

const EmploymentAgreement = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();

  const emptyForm = {
    caregiver_name: '', position_title: '', start_date: '', end_date: '',
    work_schedule: '', hourly_rate: '', payment_frequency: '', duties: '',
    emergency_procedures: '', confidentiality_terms: '', termination_terms: '',
    additional_terms: '', status: 'active',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user && activeChild) {
      fetchAgreements();
    } else if (!activeChild) {
      setIsLoading(false);
    }
  }, [user, activeChild?.id]);

  const fetchAgreements = async () => {
    if (!user || !activeChild) return;
    try {
      const { data, error } = await supabase
        .from('employment_agreements')
        .select('*')
        .eq('child_id', activeChild.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAgreements((data || []) as any as Agreement[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChild || !form.caregiver_name.trim()) return;
    try {
      const dbData = { ...form, user_id: user.id, child_id: activeChild.id };
      if (editingId) {
        const { error } = await supabase.from('employment_agreements').update(dbData).eq('id', editingId);
        if (error) throw error;
        toast({ title: "Agreement updated" });
      } else {
        const { error } = await supabase.from('employment_agreements').insert([dbData]);
        if (error) throw error;
        toast({ title: "Agreement added" });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchAgreements();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (a: Agreement) => {
    setForm({ caregiver_name: a.caregiver_name, position_title: a.position_title, start_date: a.start_date, end_date: a.end_date, work_schedule: a.work_schedule, hourly_rate: a.hourly_rate, payment_frequency: a.payment_frequency, duties: a.duties, emergency_procedures: a.emergency_procedures, confidentiality_terms: a.confidentiality_terms, termination_terms: a.termination_terms, additional_terms: a.additional_terms, status: a.status });
    setEditingId(a.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('employment_agreements').delete().eq('id', id);
      if (error) throw error;
      setAgreements(prev => prev.filter(a => a.id !== id));
      toast({ title: "Agreement removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    switch (s) { case 'active': return 'bg-green-100 text-green-800'; case 'draft': return 'bg-yellow-100 text-yellow-800'; case 'terminated': return 'bg-red-100 text-red-800'; default: return 'bg-muted text-muted-foreground'; }
  };

  if (isLoading) return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-special-600" /></div>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center"><Briefcase className="h-6 w-6 text-special-600" /></div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Employment Agreements</h2>
            <p className="text-muted-foreground">Manage caregiver employment details and contracts</p>
          </div>
        </div>
        <Button className="bg-special-600 hover:bg-special-700" onClick={() => { setForm(emptyForm); setEditingId(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add Agreement
        </Button>
      </div>

      {agreements.length > 0 ? (
        <div className="grid gap-4">
          {agreements.map(a => (
            <Card key={a.id} className="bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{a.caregiver_name}</CardTitle>
                    <CardDescription>{a.position_title}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(a.status)}>{a.status}</Badge>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {a.work_schedule && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{a.work_schedule}</span></div>}
                  {a.hourly_rate && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>{a.hourly_rate} ({a.payment_frequency || 'N/A'})</span></div>}
                  {a.start_date && <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span>{a.start_date}{a.end_date ? ` - ${a.end_date}` : ' - Present'}</span></div>}
                </div>
                {a.duties && <div className="mt-4 pt-4 border-t"><h4 className="text-sm font-medium mb-1">Duties</h4><p className="text-sm text-muted-foreground whitespace-pre-line">{a.duties}</p></div>}
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
            <Button onClick={() => setIsDialogOpen(true)} className="bg-special-600 hover:bg-special-700"><Plus className="h-4 w-4 mr-2" />Add First Agreement</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Agreement" : "New Employment Agreement"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Caregiver Name *</Label><Input value={form.caregiver_name} onChange={e => setForm({...form, caregiver_name: e.target.value})} required /></div>
              <div><Label>Position Title</Label><Input value={form.position_title} onChange={e => setForm({...form, position_title: e.target.value})} /></div>
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
              <div><Label>Work Schedule</Label><Input value={form.work_schedule} onChange={e => setForm({...form, work_schedule: e.target.value})} placeholder="e.g., Mon-Fri 8AM-5PM" /></div>
              <div><Label>Hourly Rate</Label><Input value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})} placeholder="e.g., $25/hr" /></div>
              <div><Label>Payment Frequency</Label><Select value={form.payment_frequency} onValueChange={v => setForm({...form, payment_frequency: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="biweekly">Bi-weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="terminated">Terminated</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Duties & Responsibilities</Label><Textarea value={form.duties} onChange={e => setForm({...form, duties: e.target.value})} className="min-h-[100px]" /></div>
            <div><Label>Emergency Procedures</Label><Textarea value={form.emergency_procedures} onChange={e => setForm({...form, emergency_procedures: e.target.value})} className="min-h-[80px]" /></div>
            <div><Label>Confidentiality Terms</Label><Textarea value={form.confidentiality_terms} onChange={e => setForm({...form, confidentiality_terms: e.target.value})} className="min-h-[80px]" /></div>
            <div><Label>Termination Terms</Label><Textarea value={form.termination_terms} onChange={e => setForm({...form, termination_terms: e.target.value})} className="min-h-[80px]" /></div>
            <div><Label>Additional Terms</Label><Textarea value={form.additional_terms} onChange={e => setForm({...form, additional_terms: e.target.value})} className="min-h-[80px]" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-special-600 hover:bg-special-700">{editingId ? "Update" : "Create"} Agreement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmploymentAgreement;
