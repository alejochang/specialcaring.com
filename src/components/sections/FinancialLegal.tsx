
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
import { DollarSign, Plus, Pencil, Trash2, Loader2, FileText, Building, Phone } from "lucide-react";

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
  const [docs, setDocs] = useState<FinDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();

  const emptyForm = {
    doc_type: 'other', title: '', description: '', institution: '', account_number: '',
    contact_name: '', contact_phone: '', contact_email: '', expiry_date: '', notes: '', status: 'active',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user && activeChild) fetchDocs();
  }, [user, activeChild?.id]);

  const fetchDocs = async () => {
    if (!user || !activeChild) return;
    try {
      const { data, error } = await supabase
        .from('financial_legal_docs')
        .select('*')
        .eq('child_id', activeChild.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocs((data || []) as any as FinDoc[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChild || !form.title.trim()) return;
    try {
      const dbData = { ...form, user_id: user.id, child_id: activeChild.id };
      if (editingId) {
        const { error } = await supabase.from('financial_legal_docs').update(dbData).eq('id', editingId);
        if (error) throw error;
        toast({ title: "Document updated" });
      } else {
        const { error } = await supabase.from('financial_legal_docs').insert([dbData]);
        if (error) throw error;
        toast({ title: "Document added" });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchDocs();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (d: FinDoc) => {
    setForm({ doc_type: d.doc_type, title: d.title, description: d.description, institution: d.institution, account_number: d.account_number, contact_name: d.contact_name, contact_phone: d.contact_phone, contact_email: d.contact_email, expiry_date: d.expiry_date, notes: d.notes, status: d.status });
    setEditingId(d.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('financial_legal_docs').delete().eq('id', id);
      if (error) throw error;
      setDocs(prev => prev.filter(d => d.id !== id));
      toast({ title: "Document removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statusColor = (s: string) => {
    switch (s) { case 'active': return 'bg-green-100 text-green-800'; case 'pending': return 'bg-yellow-100 text-yellow-800'; case 'expired': return 'bg-red-100 text-red-800'; case 'archived': return 'bg-muted text-muted-foreground'; default: return ''; }
  };

  const getDocTypeLabel = (t: string) => docTypes.find(d => d.value === t)?.label || t;

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
        <Button className="bg-special-600 hover:bg-special-700" onClick={() => { setForm(emptyForm); setEditingId(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add Document
        </Button>
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
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(d)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDelete(d.id)}><Trash2 className="h-3 w-3" /></Button>
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
            <Button onClick={() => setIsDialogOpen(true)} className="bg-special-600 hover:bg-special-700"><Plus className="h-4 w-4 mr-2" />Add First Document</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Document" : "Add Financial/Legal Document"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Document Type</Label><Select value={form.doc_type} onValueChange={v => setForm({...form, doc_type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{docTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div><Label>Institution</Label><Input value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} /></div>
              <div><Label>Account/Policy Number</Label><Input value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} /></div>
              <div><Label>Contact Name</Label><Input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} /></div>
              <div><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
              <div><Label>Contact Email</Label><Input value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} /></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="min-h-[80px]" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="min-h-[80px]" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-special-600 hover:bg-special-700">{editingId ? "Update" : "Add"} Document</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialLegal;
