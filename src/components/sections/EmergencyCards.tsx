
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, PlusCircle, Pencil, Camera, Upload, Trash2, Loader2, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";

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

const SIGNED_URL_EXPIRY = 3600; // 1 hour

const EmergencyCards = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [signedUrls, setSignedUrls] = useState<{ front?: string; back?: string }>({});
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  // Generate a signed URL for a private bucket file path.
  // Legacy data may contain full http URLs from when the bucket was public — pass those through.
  const getSignedImageUrl = useCallback(async (pathOrUrl: string): Promise<string | undefined> => {
    if (!pathOrUrl) return undefined;
    if (pathOrUrl.startsWith('http')) return pathOrUrl; // legacy URL
    const { data, error } = await supabase.storage
      .from('emergency-cards')
      .createSignedUrl(pathOrUrl, SIGNED_URL_EXPIRY);
    if (error || !data?.signedUrl) return undefined;
    return data.signedUrl;
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { frontImage: "", backImage: "", idType: "", idNumber: "", issueDate: "", expiryDate: "" },
  });

  // Reads from secure view which auto-decrypts sensitive fields
  const { data: cardData, isLoading } = useQuery({
    queryKey: ['emergencyCards', activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_cards_secure')
        .select('*')
        .eq('child_id', activeChild!.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const d = data as any as DbCard;
        const formVals: FormValues = {
          frontImage: d.front_image || '', backImage: d.back_image || '',
          idType: d.id_type || '', idNumber: d.id_number || '',
          issueDate: d.issue_date || '', expiryDate: d.expiry_date || '',
        };
        form.reset(formVals);
        return { formVals, dbId: d.id };
      }
      return null;
    },
    enabled: !!user && !!activeChild,
  });

  const savedData = cardData?.formVals ?? null;
  const dbId = cardData?.dbId ?? null;

  // Resolve signed URLs whenever card data changes
  useEffect(() => {
    if (!savedData) {
      setSignedUrls({});
      return;
    }
    let cancelled = false;
    const resolve = async () => {
      const [front, back] = await Promise.all([
        savedData.frontImage ? getSignedImageUrl(savedData.frontImage) : undefined,
        savedData.backImage ? getSignedImageUrl(savedData.backImage) : undefined,
      ]);
      if (!cancelled) setSignedUrls({ front, back });
    };
    resolve();
    return () => { cancelled = true; };
  }, [savedData?.frontImage, savedData?.backImage, getSignedImageUrl]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const dbData = {
        user_id: user!.id, child_id: activeChild!.id,
        front_image: values.frontImage || '', back_image: values.backImage || '',
        id_type: values.idType, id_number: values.idNumber,
        issue_date: values.issueDate || '', expiry_date: values.expiryDate || '',
      };
      if (dbId) {
        const { error } = await supabase.from('emergency_cards').update(dbData).eq('id', dbId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('emergency_cards').insert([dbData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyCards', activeChild?.id] });
      setIsEditing(false);
      toast({ title: "Information saved", description: "Emergency card information has been successfully updated." });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('emergency_cards').delete().eq('id', dbId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyCards', activeChild?.id] });
      form.reset({ frontImage: '', backImage: '', idType: '', idNumber: '', issueDate: '', expiryDate: '' });
      toast({ title: "Card deleted", description: "Emergency card information has been removed." });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const handleDeleteCard = () => {
    if (!dbId) return;
    deleteMutation.mutate();
  };

  const handleImageUpload = async (file: File, side: 'front' | 'back') => {
    if (!user || !activeChild) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    const setUploading = side === 'front' ? setUploadingFront : setUploadingBack;
    const formField = side === 'front' ? 'frontImage' : 'backImage';
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${activeChild.id}/${side}-card.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('emergency-cards')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // Store the path (not a URL) — signed URLs are generated for display
      form.setValue(formField, filePath);
      const signedUrl = await getSignedImageUrl(filePath);
      setSignedUrls((prev) => ({ ...prev, [side === 'front' ? 'front' : 'back']: signedUrl }));
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (side: 'front' | 'back') => {
    const formField = side === 'front' ? 'frontImage' : 'backImage';
    form.setValue(formField, '');
    setSignedUrls((prev) => ({ ...prev, [side]: undefined }));
  };

  const onSubmit = (values: FormValues) => {
    if (!user || !activeChild) return;
    saveMutation.mutate(values);
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Emergency Identification Cards</h2>
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
            {canEdit && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit Cards
              </Button>
            )}
            {canEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Emergency Card?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all emergency card information and uploaded images. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteCard}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                    {savedData.frontImage && signedUrls.front ? (
                      <img src={signedUrls.front} alt="ID Card Front" className="w-full h-full object-contain" />
                    ) : savedData.frontImage ? (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
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
                    {savedData.backImage && signedUrls.back ? (
                      <img src={signedUrls.back} alt="ID Card Back" className="w-full h-full object-contain" />
                    ) : savedData.backImage ? (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
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
                        signedUrls.front ? (
                          <>
                            <img src={signedUrls.front} alt="ID Front Preview" className="w-full h-full object-contain" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-70 hover:opacity-100" onClick={() => handleRemoveImage('front')}><Trash2 size={16} /></Button>
                          </>
                        ) : (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        )
                      ) : (
                        <div className="text-center p-4"><Camera size={32} className="mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Upload front image</p></div>
                      )}
                    </div>
                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'front'); e.target.value = ''; }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => frontInputRef.current?.click()}
                      disabled={uploadingFront}
                    >
                      {uploadingFront ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {uploadingFront ? 'Uploading...' : 'Upload Front Image'}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Back Side</h3>
                    <div className="w-full h-48 bg-muted rounded-md relative overflow-hidden flex items-center justify-center">
                      {form.watch('backImage') ? (
                        signedUrls.back ? (
                          <>
                            <img src={signedUrls.back} alt="ID Back Preview" className="w-full h-full object-contain" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-70 hover:opacity-100" onClick={() => handleRemoveImage('back')}><Trash2 size={16} /></Button>
                          </>
                        ) : (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        )
                      ) : (
                        <div className="text-center p-4"><Camera size={32} className="mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Upload back image</p></div>
                      )}
                    </div>
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, 'back'); e.target.value = ''; }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => backInputRef.current?.click()}
                      disabled={uploadingBack}
                    >
                      {uploadingBack ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {uploadingBack ? 'Uploading...' : 'Upload Back Image'}
                    </Button>
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
