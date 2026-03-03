import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Phone, ArrowLeft } from "lucide-react";
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
import type { OnboardingWizardAPI } from "../useOnboardingWizard";

const schema = z.object({
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface StepEmergencyContactProps {
  wizard: OnboardingWizardAPI;
}

const StepEmergencyContact = ({ wizard }: StepEmergencyContactProps) => {
  const { updateChildProfile } = useChild();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      emergencyContact: wizard.state.stepData.emergencyContact || "",
      emergencyPhone: wizard.state.stepData.emergencyPhone || "",
    },
  });

  const isSaving = wizard.state.savingStep === "emergency";

  const onSubmit = async (values: FormValues) => {
    if (!wizard.state.childId) return;

    const hasData = values.emergencyContact?.trim() || values.emergencyPhone?.trim();
    if (!hasData) {
      wizard.skipStep();
      return;
    }

    wizard.setSaving("emergency");
    try {
      await updateChildProfile(wizard.state.childId, {
        emergency_contact: values.emergencyContact || null,
        emergency_phone: values.emergencyPhone || null,
      });
      wizard.updateStepData({
        emergencyContact: values.emergencyContact,
        emergencyPhone: values.emergencyPhone,
      });
      wizard.goNext();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      wizard.setSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Phone className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Who should we call in an emergency?
        </h1>
        <p className="text-muted-foreground text-lg">
          A primary contact for {wizard.state.childName}'s care.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="emergencyContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Jane Smith (Mother)"
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
            name="emergencyPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., (555) 123-4567"
                    type="tel"
                    className="h-12 text-base"
                    {...field}
                  />
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
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => wizard.skipStep()}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-special-600 hover:bg-special-700 px-8 h-11"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepEmergencyContact;
