import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, HeartPulse, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useChild } from "@/contexts/ChildContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { OnboardingWizardAPI } from "../useOnboardingWizard";

const schema = z.object({
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface StepMedicalInfoProps {
  wizard: OnboardingWizardAPI;
}

const StepMedicalInfo = ({ wizard }: StepMedicalInfoProps) => {
  const { updateChildProfile } = useChild();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      medicalConditions: wizard.state.stepData.medicalConditions || "",
      allergies: wizard.state.stepData.allergies || "",
    },
  });

  const isSaving = wizard.state.savingStep === "medical";

  const onSubmit = async (values: FormValues) => {
    if (!wizard.state.childId) return;

    const hasData = values.medicalConditions?.trim() || values.allergies?.trim();
    if (!hasData) {
      wizard.skipStep();
      return;
    }

    wizard.setSaving("medical");
    try {
      await updateChildProfile(wizard.state.childId, {
        medical_conditions: values.medicalConditions || null,
        allergies: values.allergies || null,
      });
      wizard.updateStepData({
        medicalConditions: values.medicalConditions,
        allergies: values.allergies,
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
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <HeartPulse className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('onboarding.medicalInfo.title', { childName: wizard.state.childName })}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('onboarding.medicalInfo.subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="medicalConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.medicalInfo.medicalConditions')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('onboarding.medicalInfo.medicalConditionsPlaceholder')}
                    className="min-h-[100px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('onboarding.medicalInfo.medicalConditionsDesc')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.medicalInfo.allergies')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('onboarding.medicalInfo.allergiesPlaceholder')}
                    className="min-h-[80px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('onboarding.medicalInfo.allergiesDesc')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                {t('common.skipForNow')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-special-600 hover:bg-special-700 px-8 h-11"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('common.continue')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepMedicalInfo;
