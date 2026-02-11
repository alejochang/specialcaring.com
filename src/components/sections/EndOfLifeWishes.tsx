
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { FileCheck, Pencil, Loader2, Save, Heart, Shield, BookOpen } from "lucide-react";

interface EndOfLife {
  id: string;
  medical_directives: string;
  preferred_hospital: string;
  preferred_physician: string;
  organ_donation: string;
  funeral_preferences: string;
  religious_cultural_wishes: string;
  legal_guardian: string;
  power_of_attorney: string;
  special_instructions: string;
  additional_notes: string;
}

const EndOfLifeWishes = () => {
  const [data, setData] = useState<EndOfLife | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();

  const emptyForm = {
    medical_directives: '', preferred_hospital: '', preferred_physician: '',
    organ_donation: 'not_specified', funeral_preferences: '', religious_cultural_wishes: '',
    legal_guardian: '', power_of_attorney: '', special_instructions: '', additional_notes: '',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user && activeChild) {
      fetchData();
    } else if (!activeChild) {
      setIsLoading(false);
    }
  }, [user, activeChild?.id]);

  const fetchData = async () => {
    if (!user || !activeChild) return;
    try {
      const { data: d, error } = await supabase
        .from('end_of_life_wishes')
        .select('*')
        .eq('child_id', activeChild.id)
        .maybeSingle();
      if (error) throw error;
      if (d) {
        const typed = d as any as EndOfLife;
        setData(typed);
        setForm({
          medical_directives: typed.medical_directives || '', preferred_hospital: typed.preferred_hospital || '',
          preferred_physician: typed.preferred_physician || '', organ_donation: typed.organ_donation || 'not_specified',
          funeral_preferences: typed.funeral_preferences || '', religious_cultural_wishes: typed.religious_cultural_wishes || '',
          legal_guardian: typed.legal_guardian || '', power_of_attorney: typed.power_of_attorney || '',
          special_instructions: typed.special_instructions || '', additional_notes: typed.additional_notes || '',
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChild) return;
    try {
      const dbData = { ...form, user_id: user.id, child_id: activeChild.id };
      if (data) {
        const { error } = await supabase.from('end_of_life_wishes').update(dbData).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('end_of_life_wishes').insert([dbData]);
        if (error) throw error;
      }
      toast({ title: "Saved successfully" });
      setIsEditing(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-special-600" /></div>;

  const Section = ({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) => (
    <Card className={`bg-white ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2"><Icon className="h-5 w-5 text-special-600" />{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  if (!data && !isEditing) {
    return (
      <div className="animate-fadeIn space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center"><FileCheck className="h-6 w-6 text-special-600" /></div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">End-of-Life Wishes</h2>
            <p className="text-muted-foreground">Document advanced directives and preferences</p>
          </div>
        </div>
        <Card className="text-center py-12 bg-white">
          <CardContent>
            <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Information Recorded</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">Document important end-of-life preferences, medical directives, and guardianship information.</p>
            <Button onClick={() => setIsEditing(true)} className="bg-special-600 hover:bg-special-700">Begin Documentation</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="animate-fadeIn space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center"><FileCheck className="h-6 w-6 text-special-600" /></div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">End-of-Life Wishes</h2>
              <p className="text-muted-foreground">Document advanced directives and preferences</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Medical Directives" icon={Heart}>
            <div className="space-y-4">
              <div><Label>Advanced Medical Directives</Label><Textarea value={form.medical_directives} onChange={e => setForm({...form, medical_directives: e.target.value})} className="min-h-[120px]" placeholder="Document any advanced medical directives, DNR orders, or treatment preferences..." /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Preferred Hospital</Label><Input value={form.preferred_hospital} onChange={e => setForm({...form, preferred_hospital: e.target.value})} /></div>
                <div><Label>Preferred Physician</Label><Input value={form.preferred_physician} onChange={e => setForm({...form, preferred_physician: e.target.value})} /></div>
              </div>
              <div><Label>Organ Donation</Label><Select value={form.organ_donation} onValueChange={v => setForm({...form, organ_donation: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Yes - Organ Donor</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="not_specified">Not Specified</SelectItem></SelectContent></Select></div>
            </div>
          </Section>

          <Section title="Legal & Guardianship" icon={Shield}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Legal Guardian</Label><Input value={form.legal_guardian} onChange={e => setForm({...form, legal_guardian: e.target.value})} placeholder="Name and contact" /></div>
              <div><Label>Power of Attorney</Label><Input value={form.power_of_attorney} onChange={e => setForm({...form, power_of_attorney: e.target.value})} placeholder="Name and contact" /></div>
            </div>
          </Section>

          <Section title="Personal Wishes" icon={BookOpen}>
            <div className="space-y-4">
              <div><Label>Funeral Preferences</Label><Textarea value={form.funeral_preferences} onChange={e => setForm({...form, funeral_preferences: e.target.value})} className="min-h-[80px]" /></div>
              <div><Label>Religious/Cultural Wishes</Label><Textarea value={form.religious_cultural_wishes} onChange={e => setForm({...form, religious_cultural_wishes: e.target.value})} className="min-h-[80px]" /></div>
              <div><Label>Special Instructions</Label><Textarea value={form.special_instructions} onChange={e => setForm({...form, special_instructions: e.target.value})} className="min-h-[80px]" /></div>
              <div><Label>Additional Notes</Label><Textarea value={form.additional_notes} onChange={e => setForm({...form, additional_notes: e.target.value})} className="min-h-[80px]" /></div>
            </div>
          </Section>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => { setIsEditing(false); if (data) setForm({ medical_directives: data.medical_directives || '', preferred_hospital: data.preferred_hospital || '', preferred_physician: data.preferred_physician || '', organ_donation: data.organ_donation || 'not_specified', funeral_preferences: data.funeral_preferences || '', religious_cultural_wishes: data.religious_cultural_wishes || '', legal_guardian: data.legal_guardian || '', power_of_attorney: data.power_of_attorney || '', special_instructions: data.special_instructions || '', additional_notes: data.additional_notes || '' }); }}>Cancel</Button>
            <Button type="submit" className="bg-special-600 hover:bg-special-700"><Save className="h-4 w-4 mr-2" />Save</Button>
          </div>
        </form>
      </div>
    );
  }

  // View mode
  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center"><FileCheck className="h-6 w-6 text-special-600" /></div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">End-of-Life Wishes</h2>
            <p className="text-muted-foreground">Advanced directives and preferences</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" />Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Medical Directives" icon={Heart} className="md:col-span-2">
          {data?.medical_directives ? <p className="whitespace-pre-line">{data.medical_directives}</p> : <p className="text-muted-foreground italic">No directives recorded.</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div><h4 className="text-sm font-medium text-muted-foreground">Preferred Hospital</h4><p>{data?.preferred_hospital || "Not specified"}</p></div>
            <div><h4 className="text-sm font-medium text-muted-foreground">Preferred Physician</h4><p>{data?.preferred_physician || "Not specified"}</p></div>
            <div><h4 className="text-sm font-medium text-muted-foreground">Organ Donation</h4><p>{data?.organ_donation === 'yes' ? 'Yes' : data?.organ_donation === 'no' ? 'No' : 'Not specified'}</p></div>
          </div>
        </Section>

        <Section title="Legal & Guardianship" icon={Shield}>
          <div className="space-y-3">
            <div><h4 className="text-sm font-medium text-muted-foreground">Legal Guardian</h4><p>{data?.legal_guardian || "Not specified"}</p></div>
            <div><h4 className="text-sm font-medium text-muted-foreground">Power of Attorney</h4><p>{data?.power_of_attorney || "Not specified"}</p></div>
          </div>
        </Section>

        <Section title="Personal Wishes" icon={BookOpen}>
          <div className="space-y-3">
            {data?.funeral_preferences && <div><h4 className="text-sm font-medium text-muted-foreground">Funeral Preferences</h4><p className="whitespace-pre-line">{data.funeral_preferences}</p></div>}
            {data?.religious_cultural_wishes && <div><h4 className="text-sm font-medium text-muted-foreground">Religious/Cultural Wishes</h4><p className="whitespace-pre-line">{data.religious_cultural_wishes}</p></div>}
            {data?.special_instructions && <div><h4 className="text-sm font-medium text-muted-foreground">Special Instructions</h4><p className="whitespace-pre-line">{data.special_instructions}</p></div>}
          </div>
        </Section>
      </div>

      {data?.additional_notes && (
        <Card className="bg-white">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Additional Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-line">{data.additional_notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
};

export default EndOfLifeWishes;
