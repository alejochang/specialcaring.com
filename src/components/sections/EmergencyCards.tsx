
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, PlusCircle, Pencil, Camera, Upload, Trash2, Loader2 } from "lucide-react";
import ExportEmailButtons from "@/components/shared/ExportEmailButtons";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  frontImage: z.string().optional(),
  backImage: z.string().optional(),
  idType: z.string().min(1, "ID type is required"),
  idNumber: z.string().min(1, "ID number is required"),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DbCard {
  id: string;
  front_image: string;
  back_image: string;
  id_type: string;
  id_number: string;
  issue_date: string;
  expiry_date: string;
}

const EmergencyCards = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [savedData, setSavedData] = useState<FormValues | null>(null);
  const [dbId, setDbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frontImage: "",
      backImage: "",
      idType: "",
      idNumber: "",
      issueDate: "",
      expiryDate: "",
    },
  });

  useEffect(() => {
    if (user) fetchCard();
  }, [user]);

  const fetchCard = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('emergency_cards')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const d = data as any as DbCard;
        const formVals: FormValues = {
          frontImage: d.front_image || '',
          backImage: d.back_image || '',
          idType: d.id_type || '',
          idNumber: d.id_number || '',
          issueDate: d.issue_date || '',
          expiryDate: d.expiry_date || '',
        };
        setSavedData(formVals);
        setDbId(d.id);
        form.reset(formVals);
      }
    } catch (error: any) {
      toast({ title: "Error loading card", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      const dbData = {
        user_id: user.id,
        front_image: values.frontImage || '',
        back_image: values.backImage || '',
        id_type: values.idType,
        id_number: values.idNumber,
        issue_date: values.issueDate || '',
        expiry_date: values.expiryDate || '',
      };

      if (dbId) {
        const { error } = await supabase.from('emergency_cards').update(dbData).eq('id', dbId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('emergency_cards').insert([dbData]).select().single();
        if (error) throw error;
        setDbId((data as any).id);
      }

      setSavedData(values);
      setIsEditing(false);
      toast({ title: "Information saved", description: "Emergency card information has been successfully updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-special-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Emergency Identification Cards</h2>
          <p className="text-muted-foreground">
            Store digital copies of important identification cards
          </p>
        </div>
        {savedData && !isEditing ? (
          <div className="flex items-center gap-2">
            <ExportEmailButtons
              exportFunctionName="export-emergency-cards"
              emailFunctionName="send-emergency-cards"
              exportFilename="emergency-card.html"
              label="Emergency Card"
            />
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pencil size={16} />
              Edit Cards
            </Button>
          </div>
        ) : null}
      </div>

      {savedData && !isEditing ? (
        <Tabs defaultValue="front" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="front">Front Side</TabsTrigger>
            <TabsTrigger value="back">Back Side</TabsTrigger>
          </TabsList>
          <TabsContent value="front" className="mt-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl">ID Card Front</CardTitle>
                <CardDescription>
                  {savedData.idType} - {savedData.idNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-md h-56 bg-muted rounded-md overflow-hidden mb-4">
                    {savedData.frontImage ? (
                      <img src={savedData.frontImage} alt="ID Card Front" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image uploaded</div>
                    )}
                  </div>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div><h4 className="text-sm font-medium text-muted-foreground">ID Type</h4><p>{savedData.idType}</p></div>
                    <div><h4 className="text-sm font-medium text-muted-foreground">ID Number</h4><p>{savedData.idNumber}</p></div>
                    {savedData.issueDate && (<div><h4 className="text-sm font-medium text-muted-foreground">Issue Date</h4><p>{savedData.issueDate}</p></div>)}
                    {savedData.expiryDate && (<div><h4 className="text-sm font-medium text-muted-foreground">Expiry Date</h4><p>{savedData.expiryDate}</p></div>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="back" className="mt-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl">ID Card Back</CardTitle>
                <CardDescription>{savedData.idType} - {savedData.idNumber}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-md h-56 bg-muted rounded-md overflow-hidden mb-4">
                    {savedData.backImage ? (
                      <img src={savedData.backImage} alt="ID Card Back" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image uploaded</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="shadow-sm border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-xl">{savedData ? "Edit Emergency ID Cards" : "Add Emergency ID Cards"}</CardTitle>
            <CardDescription>Upload images of identification cards and add relevant details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-medium">Front Side</h3>
                    <div className="w-full h-48 bg-muted rounded-md relative overflow-hidden flex items-center justify-center">
                      {form.watch('frontImage') ? (
                        <>
                          <img src={form.watch('frontImage')} alt="ID Front Preview" className="w-full h-full object-contain" />
                          <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-70 hover:opacity-100" onClick={() => form.setValue('frontImage', '')}><Trash2 size={16} /></Button>
                        </>
                      ) : (
                        <div className="text-center p-4"><Camera size={32} className="mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Upload front image</p></div>
                      )}
                    </div>
                    <FormField control={form.control} name="frontImage" render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="w-full"><FormControl>
                        <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={() => onChange(placeholderImage)}><Upload size={16} />Upload Front Image</Button>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Back Side</h3>
                    <div className="w-full h-48 bg-muted rounded-md relative overflow-hidden flex items-center justify-center">
                      {form.watch('backImage') ? (
                        <>
                          <img src={form.watch('backImage')} alt="ID Back Preview" className="w-full h-full object-contain" />
                          <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-70 hover:opacity-100" onClick={() => form.setValue('backImage', '')}><Trash2 size={16} /></Button>
                        </>
                      ) : (
                        <div className="text-center p-4"><Camera size={32} className="mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Upload back image</p></div>
                      )}
                    </div>
                    <FormField control={form.control} name="backImage" render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className="w-full"><FormControl>
                        <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={() => onChange(placeholderImage)}><Upload size={16} />Upload Back Image</Button>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <FormField control={form.control} name="idType" render={({ field }) => (<FormItem><FormLabel>ID Type</FormLabel><FormControl><Input placeholder="e.g., Driver's License, Medicare Card" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="idNumber" render={({ field }) => (<FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="Card/ID Number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="issueDate" render={({ field }) => (<FormItem><FormLabel>Issue Date (Optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem><FormLabel>Expiry Date (Optional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  {isEditing && (<Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>)}
                  <Button type="submit" className="bg-caregiver-600 hover:bg-caregiver-700 flex items-center gap-2">
                    {savedData ? <Save size={16} /> : <PlusCircle size={16} />}
                    {savedData ? "Save Changes" : "Save Card Information"}
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

export default EmergencyCards;
