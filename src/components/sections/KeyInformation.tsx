
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, PlusCircle, Pencil, Loader2, Heart, Calendar, IdCard, Stethoscope, Pill, ThumbsUp, ThumbsDown, AlertTriangle, AlertCircle } from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().min(1, "Birth date is required"),
  healthCardNumber: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Please enter a valid email").optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyPhone: z.string().min(1, "Emergency phone is required"),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  doNots: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const KeyInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeChild, updateChild } = useChild();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const { data: keyInfo, isLoading } = useQuery({
    queryKey: ['keyInformation', activeChild?.id],
    queryFn: async () => {
      if (!user || !activeChild) throw new Error("No user or child found");

      // Use secure view for reading (auto-decrypts sensitive fields)
      const { data, error } = await supabase
        .from('key_information_secure')
        .select('*')
        .eq('child_id', activeChild.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!activeChild,
  });

  // Fetch medications for display
  const { data: medications = [] } = useQuery({
    queryKey: ['medications', activeChild?.id],
    queryFn: async () => {
      if (!user || !activeChild) throw new Error("No user or child found");

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('child_id', activeChild.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!activeChild,
  });

  const dbToFormValues = (dbData: any, childName?: string): FormValues => {
    if (!dbData) return {
      fullName: childName || "",
      birthDate: "",
      healthCardNumber: "",
      address: "",
      phoneNumber: "",
      email: "",
      insuranceProvider: "",
      insuranceNumber: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalConditions: "",
      allergies: "",
      likes: "",
      dislikes: "",
      doNots: "",
      additionalNotes: "",
    };

    return {
      fullName: dbData.full_name || "",
      birthDate: dbData.birth_date || "",
      healthCardNumber: dbData.health_card_number || "",
      address: dbData.address || "",
      phoneNumber: dbData.phone_number || "",
      email: dbData.email || "",
      insuranceProvider: dbData.insurance_provider || "",
      insuranceNumber: dbData.insurance_number || "",
      emergencyContact: dbData.emergency_contact || "",
      emergencyPhone: dbData.emergency_phone || "",
      medicalConditions: dbData.medical_conditions || "",
      allergies: dbData.allergies || "",
      likes: dbData.likes || "",
      dislikes: dbData.dislikes || "",
      doNots: dbData.do_nots || "",
      additionalNotes: dbData.additional_notes || "",
    };
  };

  const formToDbValues = (formData: FormValues, userId: string, childId: string) => {
    return {
      user_id: userId,
      child_id: childId,
      full_name: formData.fullName,
      birth_date: formData.birthDate,
      health_card_number: formData.healthCardNumber,
      address: formData.address,
      phone_number: formData.phoneNumber,
      email: formData.email,
      insurance_provider: formData.insuranceProvider,
      insurance_number: formData.insuranceNumber,
      emergency_contact: formData.emergencyContact,
      emergency_phone: formData.emergencyPhone,
      medical_conditions: formData.medicalConditions,
      allergies: formData.allergies,
      likes: formData.likes,
      dislikes: formData.dislikes,
      do_nots: formData.doNots,
      additional_notes: formData.additionalNotes,
      updated_at: new Date().toISOString(),
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: dbToFormValues(keyInfo, activeChild?.name),
  });

  useEffect(() => {
    form.reset(dbToFormValues(keyInfo, activeChild?.name));
  }, [keyInfo, activeChild, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user || !activeChild) throw new Error("No user or child found");

      const formattedData = formToDbValues(values, user.id, activeChild.id);

      if (keyInfo) {
        const { error } = await supabase
          .from('key_information')
          .update(formattedData)
          .eq('id', keyInfo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('key_information')
          .insert([formattedData]);

        if (error) throw error;
      }

      // Keep child selector name in sync
      if (activeChild && values.fullName !== activeChild.name) {
        await updateChild(activeChild.id, values.fullName);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyInformation', activeChild?.id] });
      setIsEditing(false);

      toast({
        title: "Child profile updated",
        description: "The child's information has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error saving child information:", error);
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    mutation.mutate(values);
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Child Profile</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please select or create a child profile first.</AlertDescription></Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-special-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-special-100 to-kids-100 flex items-center justify-center">
            <Heart className="h-8 w-8 text-special-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Child Profile</h2>
            <p className="text-muted-foreground text-lg">
              Complete snapshot of your child's essential information
            </p>
          </div>
        </div>
        {keyInfo && !isEditing && canEdit ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit Profile
          </Button>
        ) : null}
      </div>

      {keyInfo && !isEditing ? (
        <div className="space-y-6">
          {/* Header Card with Basic Info */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-special-50 to-kids-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Heart className="h-10 w-10 text-special-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-special-800">{keyInfo.full_name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(keyInfo.birth_date).toLocaleDateString()}
                        {calculateAge(keyInfo.birth_date) && (
                          <span className="ml-2 font-medium">({calculateAge(keyInfo.birth_date)} years old)</span>
                        )}
                      </span>
                    </div>
                    {keyInfo.health_card_number && (
                      <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Health Card: {keyInfo.health_card_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medical Information */}
            <Card className="shadow-sm border border-border bg-white">
              <CardHeader className="bg-red-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-red-800">
                  <Stethoscope className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {keyInfo.medical_conditions && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Medical Conditions & Diagnoses</h4>
                    <p className="text-gray-700 leading-relaxed">{keyInfo.medical_conditions}</p>
                  </div>
                )}

                {keyInfo.allergies && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Allergies</h4>
                    <p className="text-gray-700 leading-relaxed">{keyInfo.allergies}</p>
                  </div>
                )}

                {(!keyInfo.medical_conditions && !keyInfo.allergies) && (
                  <p className="text-muted-foreground italic">No medical conditions or allergies recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card className="shadow-sm border border-border bg-white">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                  <Pill className="h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {medications.length > 0 ? (
                  <div className="space-y-3">
                    {medications.map((medication, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-blue-900">{medication.name}</h5>
                            <p className="text-sm text-blue-700">{medication.dosage} - {medication.frequency}</p>
                            {medication.purpose && (
                              <p className="text-xs text-blue-600 mt-1">For: {medication.purpose}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No medications recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Preferences - Likes */}
            <Card className="shadow-sm border border-border bg-white">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-green-800">
                  <ThumbsUp className="h-5 w-5" />
                  What They Love
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {keyInfo.likes ? (
                  <p className="text-gray-700 leading-relaxed">{keyInfo.likes}</p>
                ) : (
                  <p className="text-muted-foreground italic">No preferences recorded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Preferences - Dislikes */}
            <Card className="shadow-sm border border-border bg-white">
              <CardHeader className="bg-yellow-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-yellow-800">
                  <ThumbsDown className="h-5 w-5" />
                  What They Don't Like
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {keyInfo.dislikes ? (
                  <p className="text-gray-700 leading-relaxed">{keyInfo.dislikes}</p>
                ) : (
                  <p className="text-muted-foreground italic">No dislikes recorded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Important Do Nots */}
            <Card className="shadow-sm border border-border bg-white lg:col-span-2">
              <CardHeader className="bg-red-100 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Important: Do NOT Do
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {keyInfo.do_nots ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 leading-relaxed font-medium">{keyInfo.do_nots}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No specific restrictions recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-sm border border-border bg-white lg:col-span-2">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl">Contact & Emergency Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
                    <p className="text-gray-700">{keyInfo.address}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                    <p className="text-gray-700">{keyInfo.phone_number}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                    <p className="text-gray-700">{keyInfo.email || "Not provided"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Emergency Contact</h4>
                    <p className="text-gray-700">{keyInfo.emergency_contact}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Emergency Phone</h4>
                    <p className="text-gray-700">{keyInfo.emergency_phone}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Insurance</h4>
                    <p className="text-gray-700">{keyInfo.insurance_provider || "Not provided"}</p>
                  </div>
                </div>

                {keyInfo.additional_notes && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</h4>
                    <p className="text-gray-700 leading-relaxed">{keyInfo.additional_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="shadow-sm border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-xl">
              {keyInfo ? "Edit Child Profile" : "Create Child Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-special-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-special-800">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Child's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birth Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="healthCardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Health Card Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Health card number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-red-800">Medical Information</h3>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="medicalConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions & Diagnoses</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List any medical conditions, diagnoses, or special needs"
                              className="min-h-[100px]"
                              {...field}
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
                              placeholder="List any known allergies (food, environmental, medications, etc.)"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-green-800">Preferences & Personality</h3>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="likes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What They Love</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Activities, foods, toys, routines they enjoy..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dislikes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What They Don't Like</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Things that upset them, triggers to avoid..."
                              className="min-h-[100px]"
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
                          <FormLabel>Important: Do NOT Do</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Critical safety instructions (e.g., 'Do not give small objects - choking hazard', 'Do not force fine motor activities'...)"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Contact & Emergency Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Full address" {...field} />
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
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Primary phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency contact full name" {...field} />
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
                          <FormLabel>Emergency Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency contact phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Provider (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Insurance provider name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Insurance policy number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other important information about your child"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="bg-special-600 hover:bg-special-700 flex items-center gap-2"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : keyInfo ? (
                      <Save size={16} />
                    ) : (
                      <PlusCircle size={16} />
                    )}
                    {keyInfo ? "Save Changes" : "Create Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KeyInformation;
