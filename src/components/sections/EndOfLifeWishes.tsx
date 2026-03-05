
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

const createEolSchema = (t: (key: string) => string) => z.object({
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

type EolFormValues = z.infer<ReturnType<typeof createEolSchema>>;

const EndOfLifeWishes = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEdit } = useUserRole();

  const eolSchema = useMemo(() => createEolSchema(t), [t]);

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
      const dbData = { ...values, created_by: user!.id, child_id: activeChild!.id };
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
      toast({ title: t('toast.saved') });
      setIsEditing(false);
    },
    onError: (error: any) => toast({ title: t('toast.error'), description: error.message, variant: "destructive" }),
  });

  const onSubmit = (values: EolFormValues) => {
    if (!user || !activeChild) return;
    saveMutation.mutate(values);
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">{t('sections.endOfLifeWishes.title')}</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>{t('common.noChildProfile')}</AlertDescription></Alert>
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
            <h2 className="text-3xl font-bold text-foreground">{t('sections.endOfLifeWishes.title')}</h2>
            <p className="text-muted-foreground">{t('sections.endOfLifeWishes.subtitle')}</p>
          </div>
        </div>
        <Card className="text-center py-12 bg-white">
          <CardContent>
            <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('sections.endOfLifeWishes.noInfo')}</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">{t('sections.endOfLifeWishes.noInfoDesc')}</p>
            {canEdit && <Button onClick={() => setIsEditing(true)} className="bg-special-600 hover:bg-special-700">{t('sections.endOfLifeWishes.beginDocumentation')}</Button>}
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
              <h2 className="text-3xl font-bold text-foreground">{t('sections.endOfLifeWishes.title')}</h2>
              <p className="text-muted-foreground">{t('sections.endOfLifeWishes.subtitle')}</p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Section title={t('sections.endOfLifeWishes.sections.medicalDirectives')} icon={Heart}>
              <div className="space-y-4">
                <FormField control={form.control} name="medical_directives" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.medicalDirectives')}</FormLabel><FormControl><Textarea {...field} className="min-h-[120px]" placeholder={t('sections.endOfLifeWishes.placeholders.medicalDirectives')} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="preferred_hospital" render={({ field }) => (
                    <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.preferredHospital')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="preferred_physician" render={({ field }) => (
                    <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.preferredPhysician')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="organ_donation" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.organDonation')}</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">{t('sections.endOfLifeWishes.organDonationOptions.yes')}</SelectItem><SelectItem value="no">{t('sections.endOfLifeWishes.organDonationOptions.no')}</SelectItem><SelectItem value="not_specified">{t('sections.endOfLifeWishes.organDonationOptions.notSpecified')}</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Section>

            <Section title={t('sections.endOfLifeWishes.sections.legalGuardianship')} icon={Shield}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="legal_guardian" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.legalGuardian')}</FormLabel><FormControl><Input {...field} placeholder={t('sections.endOfLifeWishes.placeholders.nameAndContact')} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="power_of_attorney" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.powerOfAttorney')}</FormLabel><FormControl><Input {...field} placeholder={t('sections.endOfLifeWishes.placeholders.nameAndContact')} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Section>

            <Section title={t('sections.endOfLifeWishes.sections.personalWishes')} icon={BookOpen}>
              <div className="space-y-4">
                <FormField control={form.control} name="funeral_preferences" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.funeralPreferences')}</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="religious_cultural_wishes" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.religiousCulturalWishes')}</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="special_instructions" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.specialInstructions')}</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="additional_notes" render={({ field }) => (
                  <FormItem><FormLabel>{t('sections.endOfLifeWishes.fields.additionalNotes')}</FormLabel><FormControl><Textarea {...field} className="min-h-[80px]" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </Section>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setIsEditing(false); if (data) form.reset(); }}>{t('common.cancel')}</Button>
              <Button type="submit" className="bg-special-600 hover:bg-special-700"><Save className="h-4 w-4 mr-2" />{t('common.save')}</Button>
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
            <h2 className="text-3xl font-bold text-foreground">{t('sections.endOfLifeWishes.title')}</h2>
            <p className="text-muted-foreground">{t('sections.endOfLifeWishes.subtitle')}</p>
          </div>
        </div>
        {canEdit && <Button variant="outline" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-2" />{t('common.edit')}</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title={t('sections.endOfLifeWishes.sections.medicalDirectives')} icon={Heart} className="md:col-span-2">
          {data?.medical_directives ? <p className="whitespace-pre-line">{data.medical_directives}</p> : <p className="text-muted-foreground italic">{t('sections.endOfLifeWishes.noDirectives')}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.preferredHospital')}</h4><p>{data?.preferred_hospital || t('sections.endOfLifeWishes.notSpecified')}</p></div>
            <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.preferredPhysician')}</h4><p>{data?.preferred_physician || t('sections.endOfLifeWishes.notSpecified')}</p></div>
            <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.organDonation')}</h4><p>{data?.organ_donation === 'yes' ? t('common.yes') : data?.organ_donation === 'no' ? t('common.no') : t('sections.endOfLifeWishes.notSpecified')}</p></div>
          </div>
        </Section>

        <Section title={t('sections.endOfLifeWishes.sections.legalGuardianship')} icon={Shield}>
          <div className="space-y-3">
            <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.legalGuardian')}</h4><p>{data?.legal_guardian || t('sections.endOfLifeWishes.notSpecified')}</p></div>
            <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.powerOfAttorney')}</h4><p>{data?.power_of_attorney || t('sections.endOfLifeWishes.notSpecified')}</p></div>
          </div>
        </Section>

        <Section title={t('sections.endOfLifeWishes.sections.personalWishes')} icon={BookOpen}>
          <div className="space-y-3">
            {data?.funeral_preferences && <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.funeralPreferences')}</h4><p className="whitespace-pre-line">{data.funeral_preferences}</p></div>}
            {data?.religious_cultural_wishes && <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.religiousCulturalWishes')}</h4><p className="whitespace-pre-line">{data.religious_cultural_wishes}</p></div>}
            {data?.special_instructions && <div><h4 className="text-sm font-medium text-muted-foreground">{t('sections.endOfLifeWishes.fields.specialInstructions')}</h4><p className="whitespace-pre-line">{data.special_instructions}</p></div>}
          </div>
        </Section>
      </div>

      {data?.additional_notes && (
        <Card className="bg-white">
          <CardHeader className="pb-3"><CardTitle className="text-lg">{t('sections.endOfLifeWishes.fields.additionalNotes')}</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-line">{data.additional_notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
};

export default EndOfLifeWishes;
