
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Loader2,
  Star,
  ArrowLeft,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/Dashboard";
import RedeemInvite from "@/components/RedeemInvite";
import { useChild } from "@/contexts/ChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const addChildSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().optional(),
});

type FormValues = z.infer<typeof addChildSchema>;

const AddChild = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const { refetch, setActiveChildId } = useChild();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(addChildSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { data: childData, error: childError } = await supabase
        .from("children")
        .insert([{ user_id: user.id, name: values.fullName }])
        .select()
        .single();

      if (childError) throw childError;

      await refetch();
      setActiveChildId(childData.id);
      toast({
        title: "Child added!",
        description: `${values.fullName}'s profile has been created. Let's complete their profile.`,
      });
      navigate("/dashboard/key-information");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-2xl py-8 px-4 md:px-6 animate-fadeIn">
        {/* Back link */}
        <Button
          variant="ghost"
          className="gap-1 mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-special-50 to-kids-50 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-6 w-6 text-special-500" />
              <h1 className="text-2xl font-bold text-special-800">Add Your Child</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your child is the star of this system — let's get started with the basics
            </p>
          </div>

          {/* Form content */}
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your child's full name"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                      <FormDescription>
                        This will be used throughout the system
                      </FormDescription>
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

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.getValues("fullName")?.trim()}
                    className="gap-1 bg-special-600 hover:bg-special-700"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Continue to Profile
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Invite code section below */}
        <div className="mt-6 text-center">
          <Separator className="mb-6" />
          <p className="text-sm text-muted-foreground mb-3">
            Or join an existing child's care team
          </p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsRedeemOpen(true)}
          >
            <Ticket className="h-4 w-4" /> Join with Invite Code
          </Button>
        </div>

        <RedeemInvite open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />
      </div>
    </DashboardLayout>
  );
};

export default AddChild;
