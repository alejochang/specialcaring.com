import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pill, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { OnboardingWizardAPI } from "../useOnboardingWizard";

const createSchema = (t: (key: string) => string) => z
  .object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  })
  .superRefine((data, ctx) => {
    const anyFilled = data.name.trim() || data.dosage.trim() || data.frequency.trim();
    if (anyFilled && !data.name.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.medicationNameRequired'),
        path: ["name"],
      });
    }
  });

type FormValues = z.infer<ReturnType<typeof createSchema>>;

interface StepMedicationProps {
  wizard: OnboardingWizardAPI;
}

const StepMedication = ({ wizard }: StepMedicationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const schema = useMemo(() => createSchema(t), [t]);

  // If medication already saved (user navigated back), show confirmation
  if (wizard.state.stepData.medication) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('onboarding.medication.addedTitle')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('onboarding.medication.addedMessage', { name: wizard.state.stepData.medication.name })}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            className="gap-1 text-muted-foreground"
            onClick={() => wizard.goPrev()}
          >
            <ArrowLeft className="h-4 w-4" /> {t('common.back')}
          </Button>
          <Button
            onClick={() => wizard.goNext()}
            className="bg-special-600 hover:bg-special-700 px-8 h-11"
          >
            {t('common.continue')}
          </Button>
        </div>
      </div>
    );
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", dosage: "", frequency: "" },
  });

  const isSaving = wizard.state.savingStep === "medication";

  const onSubmit = async (values: FormValues) => {
    if (!user || !wizard.state.childId) return;

    // If all empty, treat as skip
    if (!values.name.trim() && !values.dosage.trim() && !values.frequency.trim()) {
      wizard.skipStep();
      return;
    }

    wizard.setSaving("medication");
    try {
      const { data, error } = await supabase
        .from("medications")
        .insert([{
          created_by: user.id,
          child_id: wizard.state.childId,
          name: values.name,
          dosage: values.dosage || "",
          frequency: values.frequency || "",
        }])
        .select("id")
        .single();

      if (error) throw error;

      wizard.updateStepData({
        medication: {
          id: data.id,
          name: values.name,
          dosage: values.dosage,
          frequency: values.frequency,
        },
      });
      wizard.goNext();
    } catch (error: any) {
      toast({ title: t('toast.error'), description: error.message, variant: "destructive" });
    } finally {
      wizard.setSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Pill className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('onboarding.medication.title', { childName: wizard.state.childName })}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('onboarding.medication.subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.medication.medicationName')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('onboarding.medication.medicationNamePlaceholder')}
                    className="h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('onboarding.medication.dosage')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('onboarding.medication.dosagePlaceholder')}
                      className="h-12 text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('onboarding.medication.frequency')}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder={t('onboarding.medication.frequencyPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once_daily">{t('onboarding.medication.frequencies.once_daily')}</SelectItem>
                        <SelectItem value="twice_daily">{t('onboarding.medication.frequencies.twice_daily')}</SelectItem>
                        <SelectItem value="three_daily">{t('onboarding.medication.frequencies.three_daily')}</SelectItem>
                        <SelectItem value="four_daily">{t('onboarding.medication.frequencies.four_daily')}</SelectItem>
                        <SelectItem value="as_needed">{t('onboarding.medication.frequencies.as_needed')}</SelectItem>
                        <SelectItem value="weekly">{t('onboarding.medication.frequencies.weekly')}</SelectItem>
                        <SelectItem value="other">{t('onboarding.medication.frequencies.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              className="gap-1 text-muted-foreground"
              onClick={() => wizard.goPrev()}
            >
              <ArrowLeft className="h-4 w-4" /> {t('common.back')}
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => wizard.skipStep()}
              >
                {t('onboarding.medication.noMedications')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-special-600 hover:bg-special-700 px-8 h-11"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('onboarding.medication.addAndContinue')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepMedication;
