import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { OnboardingWizardAPI } from "../useOnboardingWizard";

const createSchema = (t: (key: string) => string) => z.object({
  fullName: z.string().min(2, t('validation.nameMinLength')),
});

type FormValues = z.infer<ReturnType<typeof createSchema>>;

interface StepChildNameProps {
  wizard: OnboardingWizardAPI;
}

const StepChildName = ({ wizard }: StepChildNameProps) => {
  const { user } = useAuth();
  const { refetch, setActiveChildId } = useChild();
  const { toast } = useToast();
  const { t } = useTranslation();

  const schema = useMemo(() => createSchema(t), [t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: wizard.state.childName || "" },
  });

  const isSaving = wizard.state.savingStep === "name";

  // If child already created (user navigated back), show confirmation
  if (wizard.state.childId) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('onboarding.childName.alreadyAdded', { childName: wizard.state.childName })}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('onboarding.childName.alreadyAddedSubtitle')}
          </p>
        </div>
        <Button
          onClick={() => wizard.goNext()}
          className="bg-special-600 hover:bg-special-700 px-8"
        >
          {t('common.continue')}
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    wizard.setSaving("name");

    try {
      const { data: childData, error } = await supabase
        .from("children")
        .insert([{
          created_by: user.id,
          name: values.fullName,
          full_name: values.fullName,
        }])
        .select()
        .single();

      if (error) throw error;

      await refetch();
      setActiveChildId(childData.id);
      wizard.setChildCreated(childData.id, values.fullName);
      toast({
        title: t('onboarding.childName.createdToast', { name: values.fullName }),
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
        <div className="w-12 h-12 rounded-full bg-special-100 flex items-center justify-center">
          <Star className="h-6 w-6 text-special-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('onboarding.childName.title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('onboarding.childName.subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t('onboarding.childName.placeholder')}
                    className="h-12 text-lg"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving || !form.watch("fullName")?.trim()}
              className="bg-special-600 hover:bg-special-700 px-8 h-11"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('onboarding.childName.continueBtn')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepChildName;
