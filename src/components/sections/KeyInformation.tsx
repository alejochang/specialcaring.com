import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, PlusCircle, Pencil, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  birthDate: z.string().min(1, "Birth date is required"),
  ssn: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Please enter a valid email").optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyPhone: z.string().min(1, "Emergency phone is required"),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const KeyInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: keyInfo, isLoading } = useQuery({
    queryKey: ['keyInformation', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("No user found");
      
      const { data, error } = await supabase
        .from('key_information')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const dbToFormValues = (dbData: any): FormValues => {
    if (!dbData) return {
      fullName: "",
      birthDate: "",
      ssn: "",
      address: "",
      phoneNumber: "",
      email: "",
      insuranceProvider: "",
      insuranceNumber: "",
      emergencyContact: "",
      emergencyPhone: "",
      additionalNotes: "",
    };
    
    return {
      fullName: dbData.full_name,
      birthDate: dbData.birth_date,
      ssn: dbData.ssn || "",
      address: dbData.address,
      phoneNumber: dbData.phone_number,
      email: dbData.email || "",
      insuranceProvider: dbData.insurance_provider || "",
      insuranceNumber: dbData.insurance_number || "",
      emergencyContact: dbData.emergency_contact,
      emergencyPhone: dbData.emergency_phone,
      additionalNotes: dbData.additional_notes || "",
    };
  };

  const formToDbValues = (formData: FormValues, userId: string) => {
    return {
      user_id: userId,
      full_name: formData.fullName,
      birth_date: formData.birthDate,
      ssn: formData.ssn,
      address: formData.address,
      phone_number: formData.phoneNumber,
      email: formData.email,
      insurance_provider: formData.insuranceProvider,
      insurance_number: formData.insuranceNumber,
      emergency_contact: formData.emergencyContact,
      emergency_phone: formData.emergencyPhone,
      additional_notes: formData.additionalNotes,
      updated_at: new Date().toISOString(),
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: dbToFormValues(keyInfo),
  });

  useEffect(() => {
    if (keyInfo) {
      form.reset(dbToFormValues(keyInfo));
    }
  }, [keyInfo, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("No user found");
      
      const formattedData = formToDbValues(values, user.id);
      
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyInformation', user?.id] });
      setIsEditing(false);
      
      toast({
        title: "Information saved",
        description: "Key information has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error saving key information:", error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-caregiver-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Key Information</h2>
          <p className="text-muted-foreground">
            Manage essential personal and contact information
          </p>
        </div>
        {keyInfo && !isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit Information
          </Button>
        ) : null}
      </div>

      {keyInfo && !isEditing ? (
        <Card className="shadow-sm border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {keyInfo.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Birth Date</h4>
                  <p>{keyInfo.birth_date}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                  <p>{keyInfo.address}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Phone Number</h4>
                  <p>{keyInfo.phone_number}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p>{keyInfo.email || "Not provided"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Insurance Provider</h4>
                  <p>{keyInfo.insurance_provider || "Not provided"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Insurance Number</h4>
                  <p>{keyInfo.insurance_number || "Not provided"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Emergency Contact</h4>
                  <p>{keyInfo.emergency_contact}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Emergency Phone</h4>
                  <p>{keyInfo.emergency_phone}</p>
                </div>
              </div>
              
              {keyInfo.additional_notes && (
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Additional Notes</h4>
                  <p>{keyInfo.additional_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-xl">
              {keyInfo ? "Edit Key Information" : "Add Key Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                    name="ssn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Security Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="XXX-XX-XXXX" {...field} />
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
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State, ZIP" {...field} />
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
                          <Input placeholder="(555) 123-4567" {...field} />
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
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Insurance Provider Name" {...field} />
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
                          <Input placeholder="Insurance Policy Number" {...field} />
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
                          <Input placeholder="Emergency Contact Full Name" {...field} />
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
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional important information here" 
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
                    className="bg-caregiver-600 hover:bg-caregiver-700 flex items-center gap-2"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : keyInfo ? (
                      <Save size={16} />
                    ) : (
                      <PlusCircle size={16} />
                    )}
                    {keyInfo ? "Save Changes" : "Save Information"}
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
