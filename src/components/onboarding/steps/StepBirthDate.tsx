import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Cake, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useChild } from "@/contexts/ChildContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { OnboardingWizardAPI } from "../useOnboardingWizard";

const schema = z.object({
  birthDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface StepBirthDateProps {
  wizard: OnboardingWizardAPI;
}

const StepBirthDate = ({ wizard }: StepBirthDateProps) => {
  const { updateChildProfile } = useChild();
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { birthDate: wizard.state.stepData.birthDate || "" },
  });

  const isSaving = wizard.state.savingStep === "birthDate";

  const onSubmit = async (values: FormValues) => {
    if (!wizard.state.childId) return;

    if (!values.birthDate) {
      wizard.skipStep();
      return;
    }

    wizard.setSaving("birthDate");
    try {
      await updateChildProfile(wizard.state.childId, {
        birth_date: values.birthDate,
      });
      wizard.updateStepData({ birthDate: values.birthDate });
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
        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
          <Cake className="h-6 w-6 text-pink-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('onboarding.birthDate.title', { childName: wizard.state.childName })}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('onboarding.birthDate.subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.birthDate.label')}</FormLabel>
                <FormControl>
                  <Input type="date" className="h-12 text-lg" {...field} />
                </FormControl>
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

export default StepBirthDate;
