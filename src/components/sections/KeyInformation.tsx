
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, PlusCircle, Pencil } from "lucide-react";

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
  const [savedData, setSavedData] = useState<FormValues | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: savedData || {
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
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSavedData(values);
      setIsEditing(false);
      
      toast({
        title: "Information saved",
        description: "Key information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Key Information</h2>
          <p className="text-muted-foreground">
            Manage essential personal and contact information
          </p>
        </div>
        {savedData && !isEditing ? (
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

      {savedData && !isEditing ? (
        <Card className="shadow-sm border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {savedData.fullName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Birth Date</h4>
                  <p>{savedData.birthDate}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                  <p>{savedData.address}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Phone Number</h4>
                  <p>{savedData.phoneNumber}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p>{savedData.email || "Not provided"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Insurance Provider</h4>
                  <p>{savedData.insuranceProvider || "Not provided"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Insurance Number</h4>
                  <p>{savedData.insuranceNumber || "Not provided"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Emergency Contact</h4>
                  <p>{savedData.emergencyContact}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Emergency Phone</h4>
                  <p>{savedData.emergencyPhone}</p>
                </div>
              </div>
              
              {savedData.additionalNotes && (
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Additional Notes</h4>
                  <p>{savedData.additionalNotes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-xl">
              {savedData ? "Edit Key Information" : "Add Key Information"}
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
                  <Button type="submit" className="bg-caregiver-600 hover:bg-caregiver-700 flex items-center gap-2">
                    {savedData ? <Save size={16} /> : <PlusCircle size={16} />}
                    {savedData ? "Save Changes" : "Save Information"}
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
