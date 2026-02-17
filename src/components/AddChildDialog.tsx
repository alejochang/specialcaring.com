
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Heart, User, Phone, Stethoscope, ChevronRight, ChevronLeft, Loader2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const step1Schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().optional(),
});

const step2Schema = z.object({
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const step3Schema = z.object({
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  doNots: z.string().optional(),
});

const fullSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  doNots: z.string().optional(),
});

type FormValues = z.infer<typeof fullSchema>;

const steps = [
  { title: "About Your Child", icon: Heart, description: "Let's start with the basics" },
  { title: "Emergency Contacts", icon: Phone, description: "Who to call in an emergency" },
  { title: "Medical & Safety", icon: Stethoscope, description: "Critical care information" },
];

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddChildDialog = ({ open, onOpenChange }: AddChildDialogProps) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refetch, setActiveChildId } = useChild();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      emergencyContact: "",
      emergencyPhone: "",
      address: "",
      phoneNumber: "",
      medicalConditions: "",
      allergies: "",
      doNots: "",
    },
  });

  const resetAndClose = () => {
    form.reset();
    setStep(0);
    onOpenChange(false);
  };

  const handleNext = async () => {
    let isValid = false;
    if (step === 0) {
      isValid = await form.trigger(["fullName", "birthDate"]);
    } else if (step === 1) {
      isValid = await form.trigger(["emergencyContact", "emergencyPhone", "address", "phoneNumber"]);
    }
    if (isValid) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Create the child record
      const { data: childData, error: childError } = await supabase
        .from("children")
        .insert([{ user_id: user.id, name: values.fullName }])
        .select()
        .single();

      if (childError) throw childError;

      // Create key_information record with the profile data
      const hasProfileData = values.birthDate || values.emergencyContact || values.emergencyPhone ||
        values.address || values.phoneNumber || values.medicalConditions || values.allergies || values.doNots;

      if (hasProfileData) {
        const { error: keyInfoError } = await supabase
          .from("key_information")
          .insert([{
            user_id: user.id,
            child_id: childData.id,
            full_name: values.fullName,
            birth_date: values.birthDate || "",
            emergency_contact: values.emergencyContact || "",
            emergency_phone: values.emergencyPhone || "",
            address: values.address || "",
            phone_number: values.phoneNumber || "",
            medical_conditions: values.medicalConditions || "",
            allergies: values.allergies || "",
            do_nots: values.doNots || "",
          }]);

        if (keyInfoError) {
          console.error("Key info insert error:", keyInfoError);
          // Don't fail the whole flow — child is created
        }
      }

      // Refetch children and set active
      await refetch();
      setActiveChildId(childData.id);
      toast({ title: "Child added! 🎉", description: `${values.fullName}'s profile has been created.` });
      resetAndClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden">
        {/* Header with step indicator */}
        <div className="bg-gradient-to-r from-special-50 to-kids-50 p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-special-800 flex items-center gap-2">
              <Star className="h-6 w-6 text-special-500" />
              Add Your Child
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your child is the star of this system — let's set up their profile
            </p>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors
                  ${i === step
                    ? "bg-special-600 text-white"
                    : i < step
                      ? "bg-special-200 text-special-700"
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${i === step ? "text-special-700" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < step ? "bg-special-300" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Step description */}
            <div className="flex items-center gap-3 pb-2">
              {(() => {
                const StepIcon = steps[step].icon;
                return <StepIcon className="h-5 w-5 text-special-500" />;
              })()}
              <div>
                <h3 className="font-semibold text-foreground">{steps[step].title}</h3>
                <p className="text-xs text-muted-foreground">{steps[step].description}</p>
              </div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 0 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your child's full name" {...field} autoFocus />
                      </FormControl>
                      <FormDescription>This will be used throughout the system</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Emergency Contacts */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jane Smith (Mom)" {...field} autoFocus />
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
                      <FormLabel>Emergency Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, Province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 987-6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Medical & Safety */}
            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions & Diagnoses</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List any medical conditions, diagnoses, or special needs..."
                          className="min-h-[80px]"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List any allergies (food, medication, environmental)..."
                          className="min-h-[60px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doNots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-destructive font-semibold">⚠️ Important: Do NOT Do</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Critical safety instructions — things that should NEVER be done..."
                          className="min-h-[60px] border-destructive/30 focus-visible:ring-destructive/30"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This information is highlighted prominently for all caregivers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                {step > 0 ? (
                  <Button type="button" variant="ghost" onClick={handleBack} className="gap-1">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={resetAndClose}>
                    Cancel
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {step < steps.length - 1 ? (
                  <>
                    {step > 0 && (
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={isSubmitting || !form.getValues("fullName")?.trim()}
                      >
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save & Finish Later
                      </Button>
                    )}
                    <Button type="button" onClick={handleNext} className="gap-1 bg-special-600 hover:bg-special-700">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.getValues("fullName")?.trim()}
                    className="gap-1 bg-special-600 hover:bg-special-700"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Profile
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChildDialog;
