
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";
import { FileCheck, Pencil, Loader2, Save, Heart, Shield, BookOpen, AlertCircle } from "lucide-react";

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

const eolSchema = z.object({
  medical_directives: z.string().optional(),
  preferred_hospital: z.string().optional(),
  preferred_physician: z.string().optional(),
  organ_donation: z.enum(['yes', 'no', 'not_specified']),
  funeral_preferences: z.string().optional(),
  religious_cultural_wishes: z.string().optional(),
  legal_guardian: z.string().optional(),
  power_of_attorney: z.string().optional(),
  special_instructions: z.string().optional(),
  additional_notes: z.string().optional(),
});

type EolFormValues = z.infer<typeof eolSchema>;

const EndOfLifeWishes = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEdit } = useUserRole();

  const form = useForm<EolFormValues>({
    resolver: zodResolver(eolSchema),
    defaultValues: {
      medical_directives: '', preferred_hospital: '', preferred_physician: '',
      organ_donation: 'not_specified', funeral_preferences: '', religious_cultural_wishes: '',
      legal_guardian: '', power_of_attorney: '', special_instructions: '', additional_notes: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['endOfLifeWishes', activeChild?.id],
    queryFn: async () => {
      const { data: d, error } = await supabase
        .from('end_of_life_wishes')
        .select('*')
        .eq('child_id', activeChild!.id)
        .maybeSingle();
      if (error) throw error;
      return d ? (d as any as EndOfLife) : null;
    },
    enabled: !!user && !!activeChild,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        medical_directives: data.medical_directives || '', preferred_hospital: data.preferred_hospital || '',
        preferred_physician: data.preferred_physician || '', organ_donation: (data.organ_donation as 'yes' | 'no' | 'not_specified') || 'not_specified',
        funeral_preferences: data.funeral_preferences || '', religious_cultural_wishes: data.religious_cultural_wishes || '',
        legal_guardian: data.legal_guardian || '', power_of_attorney: data.power_of_attorney || '',
        special_instructions: data.special_instructions || '', additional_notes: data.additional_notes || '',
      });
    }
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: EolFormValues) => {
      const dbData = { ...values, user_id: user!.id, child_id: activeChild!.id };
      if (data) {
        const { error } = await supabase.from('end_of_life_wishes').update(dbData).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('end_of_life_wishes').insert([dbData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endOfLifeWishes', activeChild?.id] });
      toast({ title: "Saved successfully" });
      setIsEditing(false);
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const onSubmit = (values: EolFormValues) => {
    if (!user || !activeChild) return;
    saveMutation.mutate(values);
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">End-of-Life Wishes</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please select or create a child profile first.</AlertDescription></Alert>
      </div>
    );
  }

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
            {canEdit && <Button onClick={() => setIsEditing(true)} className="bg-special-600 hover:bg-special-700">Begin Documentation</Button>}
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Section title="Medical Directives" icon={Heart}>
              <div className="space-y-4">
                <FormField control={form.control} name="medical_directives" render={({ field }) => (
                  <FormItem><FormLabel>Advanced Medical Directives</FormLabel><FormControl><Textarea {...field} className="min-h-[120px]" placeholder="Document any advanced medical directives, DNR orders, or treatment preferences..." /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="preferred_hospital" render={({ field }) => (
                    <FormItem><FormLabel>Preferred Hospital</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="preferred_physician" render={({ field }) => (
                    <FormItem><FormLabel>Preferred Physician</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="organ_donation" render={({ field }) => (
                  <FormItem><FormLabel>Organ Donation</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Yes - Organ Donor</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="not_specified">Not Specified</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Section>

            <Section title="Legal & Guardianship" icon={Shield}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="legal_guardian" render={({ field }) => (
                  <FormItem><FormLabel>Legal Guardian</FormLabel><FormControl><Input {...field} placeholder="Name and contact" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="power_of_attorney" render={({ field }) => (
                  <FormItem><FormLabel>Power of Attorney</FormLabel><FormControl><Input {...field} placeholder="Name and contact" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Section>

            <Section title="Personal Wishes" icon={BookOpen}>
              <div className="space-y-4">
                <FormField control={form.control} name="funeral_preferences" render={({ field }) => (
                  <FormItem><FormLabel>Funeral Preferences</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="religious_cultural_wishes" render={({ field }) => (
                  <FormItem><FormLabel>Religious/Cultural Wishes</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="special_instructions" render={({ field }) => (
                  <FormItem><FormLabel>Special Instructions</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="additional_notes" render={({ field }) => (
                  <FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Section>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setIsEditing(false); if (data) form.reset(); }}>Cancel</Button>
              <Button type="submit" className="bg-special-600 hover:bg-special-700"><Save className="h-4 w-4 mr-2" />Save</Button>
            </div>
          </form>
        </Form>
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
        {canEdit && <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" />Edit</Button>}
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
