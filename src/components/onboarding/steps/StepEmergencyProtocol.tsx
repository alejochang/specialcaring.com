import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ShieldAlert, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingWizardAPI } from "../useOnboardingWizard";

const schema = z
  .object({
    title: z.string(),
    severity: z.string(),
    immediateSteps: z.string(),
  })
  .superRefine((data, ctx) => {
    const anyFilled = data.title.trim() || data.immediateSteps.trim();
    if (anyFilled && !data.title.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Protocol title is required",
        path: ["title"],
      });
    }
    if (anyFilled && !data.immediateSteps.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Immediate steps are required",
        path: ["immediateSteps"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface StepEmergencyProtocolProps {
  wizard: OnboardingWizardAPI;
}

const StepEmergencyProtocol = ({ wizard }: StepEmergencyProtocolProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // If protocol already saved (user navigated back), show confirmation
  if (wizard.state.stepData.protocol) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Emergency protocol added
          </h1>
          <p className="text-muted-foreground text-lg">
            You've set up <span className="font-medium text-foreground">{wizard.state.stepData.protocol.title}</span>.
            You can add more protocols from the Emergency Protocols section later.
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            className="gap-1 text-muted-foreground"
            onClick={() => wizard.goPrev()}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={() => wizard.goNext()}
            className="bg-special-600 hover:bg-special-700 px-8 h-11"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", severity: "moderate", immediateSteps: "" },
  });

  const isSaving = wizard.state.savingStep === "protocol";

  const onSubmit = async (values: FormValues) => {
    if (!user || !wizard.state.childId) return;

    // If all empty, treat as skip
    if (!values.title.trim() && !values.immediateSteps.trim()) {
      wizard.skipStep();
      return;
    }

    wizard.setSaving("protocol");
    try {
      const { data, error } = await supabase
        .from("emergency_protocols")
        .insert([{
          created_by: user.id,
          child_id: wizard.state.childId,
          title: values.title,
          severity: values.severity || "moderate",
          emergency_contacts: "",
          immediate_steps: values.immediateSteps,
        }])
        .select("id")
        .single();

      if (error) throw error;

      wizard.updateStepData({
        protocol: {
          id: data.id,
          title: values.title,
          severity: values.severity,
          immediateSteps: values.immediateSteps,
        },
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
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-orange-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Set up an emergency protocol for {wizard.state.childName}?
        </h1>
        <p className="text-muted-foreground text-lg">
          Step-by-step instructions a caregiver can follow in a medical situation.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protocol Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Seizure Response"
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
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity Level</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="immediateSteps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Immediate Steps to Take</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={"1. Stay calm and note the time\n2. Clear the area of hazards\n3. Call 911 if lasting more than 5 minutes\n4. ..."}
                    className="min-h-[120px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Write clear, numbered steps that anyone can follow.
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
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => wizard.skipStep()}
              >
                I'll set this up later
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-special-600 hover:bg-special-700 px-8 h-11"
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add & Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepEmergencyProtocol;
