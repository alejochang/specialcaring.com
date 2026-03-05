
import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, Pencil, Loader2, Heart, Calendar, IdCard, Stethoscope, Pill, ThumbsUp, ThumbsDown, AlertTriangle, AlertCircle } from "lucide-react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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

const createFormSchema = (t: (key: string) => string) =>
  z.object({
    fullName: z.string().min(2, t('validation.nameMinLength')),
    birthDate: z.string().optional(),
    healthCardNumber: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email(t('validation.invalidEmail')).optional().or(z.literal("")),
    insuranceProvider: z.string().optional(),
    insuranceNumber: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    medicalConditions: z.string().optional(),
    allergies: z.string().optional(),
    likes: z.string().optional(),
    dislikes: z.string().optional(),
    doNots: z.string().optional(),
    additionalNotes: z.string().optional(),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

/**
 * KeyInformation — edits profile fields directly on the children table.
 * After the domain merge, the child IS the profile. No separate entity needed.
 * Reads from `children_secure` view (auto-decrypts sensitive fields).
 * Writes directly to `children` table via updateChildProfile.
 */
const KeyInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeChild, updateChildProfile, refetch } = useChild();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const formSchema = useMemo(() => createFormSchema(t), [t]);

  // Read from the secure view for decrypted sensitive fields
  const { data: childProfile, isLoading } = useQuery({
    queryKey: ['childProfile', activeChild?.id],
    queryFn: async () => {
      if (!user || !activeChild) throw new Error("No user or child found");

      const { data, error } = await supabase
        .from('children_secure')
        .select('*')
        .eq('id', activeChild.id)
        .single();

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

  // Profile is incomplete if essential fields are missing
  const isIncompleteProfile = !isLoading && childProfile && !childProfile.birth_date;

  const childToFormValues = (child: any): FormValues => {
    return {
      fullName: child?.full_name || child?.name || "",
      birthDate: child?.birth_date || "",
      healthCardNumber: child?.health_card_number || "",
      address: child?.address || "",
      phoneNumber: child?.phone_number || "",
      email: child?.email || "",
      insuranceProvider: child?.insurance_provider || "",
      insuranceNumber: child?.insurance_number || "",
      emergencyContact: child?.emergency_contact || "",
      emergencyPhone: child?.emergency_phone || "",
      medicalConditions: child?.medical_conditions || "",
      allergies: child?.allergies || "",
      likes: child?.likes || "",
      dislikes: child?.dislikes || "",
      doNots: child?.do_nots || "",
      additionalNotes: child?.additional_notes || "",
    };
  };

  /** Convert form values to snake_case DB columns for the children table */
  const formToDbValues = (formData: FormValues) => {
    return {
      name: formData.fullName,
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
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: childToFormValues(childProfile || activeChild),
  });

  // Re-initialize form when profile data changes
  useEffect(() => {
    form.reset(childToFormValues(childProfile || activeChild));
  }, [childProfile, activeChild, form]);

  // Auto-enter edit mode for incomplete profiles
  useEffect(() => {
    if (isIncompleteProfile && canEdit) {
      setIsEditing(true);
    }
  }, [isIncompleteProfile, canEdit]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user || !activeChild) throw new Error("No user or child found");

      // Write directly to children table — the child IS the profile
      const profileData = formToDbValues(values);
      await updateChildProfile(activeChild.id, profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childProfile', activeChild?.id] });
      refetch(); // Refresh context so activeChild reflects new profile data
      setIsEditing(false);

      toast({
        title: t('sections.keyInformation.toast.profileUpdated'),
        description: t('sections.keyInformation.toast.profileUpdatedDesc'),
      });
    },
    onError: (error) => {
      console.error("Error saving child information:", error);
      toast({
        title: t('sections.keyInformation.toast.errorSaving'),
        description: t('sections.keyInformation.toast.errorSavingDesc'),
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
        <h2 className="text-3xl font-bold text-foreground">{t('sections.keyInformation.title')}</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>{t('common.noChildProfile')}</AlertDescription></Alert>
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
            {isIncompleteProfile ? (
              <>
                <h2 className="text-3xl font-bold text-foreground">
                  {t('sections.keyInformation.completeProfile', { childName: activeChild.name })}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {t('sections.keyInformation.completeProfileHelp')}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-foreground">{t('sections.keyInformation.title')}</h2>
                <p className="text-muted-foreground text-lg">
                  {t('sections.keyInformation.subtitle')}
                </p>
              </>
            )}
          </div>
        </div>
        {childProfile && !isEditing && canEdit ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Pencil size={16} />
            {t('sections.keyInformation.editProfile')}
          </Button>
        ) : null}
      </div>

      {childProfile && !isEditing ? (
        <div className="space-y-6">
          {/* Header Card with Basic Info */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-special-50 to-kids-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Heart className="h-10 w-10 text-special-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-special-800">{childProfile.full_name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(childProfile.birth_date).toLocaleDateString()}
                        {calculateAge(childProfile.birth_date) && (
                          <span className="ml-2 font-medium">{t('sections.keyInformation.yearsOld', { age: calculateAge(childProfile.birth_date) })}</span>
                        )}
                      </span>
                    </div>
                    {childProfile.health_card_number && (
                      <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('sections.keyInformation.healthCard', { number: childProfile.health_card_number })}</span>
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
                  {t('sections.keyInformation.medicalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {childProfile.medical_conditions && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">{t('sections.keyInformation.fields.medicalConditions')}</h4>
                    <p className="text-gray-700 leading-relaxed">{childProfile.medical_conditions}</p>
                  </div>
                )}

                {childProfile.allergies && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">{t('sections.keyInformation.fields.allergies')}</h4>
                    <p className="text-gray-700 leading-relaxed">{childProfile.allergies}</p>
                  </div>
                )}

                {(!childProfile.medical_conditions && !childProfile.allergies) && (
                  <p className="text-muted-foreground italic">{t('sections.keyInformation.noMedicalInfo')}</p>
                )}
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card className="shadow-sm border border-border bg-white">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
                  <Pill className="h-5 w-5" />
                  {t('sections.keyInformation.currentMedications')}
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
                              <p className="text-xs text-blue-600 mt-1">{t('sections.keyInformation.forPurpose', { purpose: medication.purpose })}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {t('sections.keyInformation.active')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">{t('sections.keyInformation.noMedicationsRecorded')}</p>
                )}
              </CardContent>
            </Card>

            {/* Preferences - Likes */}
            <Card className="shadow-sm border border-border bg-white">
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-green-800">
                  <ThumbsUp className="h-5 w-5" />
                  {t('sections.keyInformation.whatTheyLove')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {childProfile.likes ? (
                  <p className="text-gray-700 leading-relaxed">{childProfile.likes}</p>
                ) : (
                  <p className="text-muted-foreground italic">{t('sections.keyInformation.noPreferencesRecorded')}</p>
                )}
              </CardContent>
            </Card>

            {/* Preferences - Dislikes */}
            <Card className="shadow-sm border border-border bg-white">
              <CardHeader className="bg-yellow-50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-yellow-800">
                  <ThumbsDown className="h-5 w-5" />
                  {t('sections.keyInformation.whatTheyDontLike')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {childProfile.dislikes ? (
                  <p className="text-gray-700 leading-relaxed">{childProfile.dislikes}</p>
                ) : (
                  <p className="text-muted-foreground italic">{t('sections.keyInformation.noDislikesRecorded')}</p>
                )}
              </CardContent>
            </Card>

            {/* Important Do Nots */}
            <Card className="shadow-sm border border-border bg-white lg:col-span-2">
              <CardHeader className="bg-red-100 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  {t('sections.keyInformation.doNots')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {childProfile.do_nots ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 leading-relaxed font-medium">{childProfile.do_nots}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">{t('sections.keyInformation.noRestrictionsRecorded')}</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-sm border border-border bg-white lg:col-span-2">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl">{t('sections.keyInformation.contactEmergency')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('sections.keyInformation.fields.address')}</h4>
                    <p className="text-gray-700">{childProfile.address}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('sections.keyInformation.fields.phoneNumber')}</h4>
                    <p className="text-gray-700">{childProfile.phone_number}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('sections.keyInformation.fields.email')}</h4>
                    <p className="text-gray-700">{childProfile.email || t('sections.keyInformation.notProvided')}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('sections.keyInformation.fields.emergencyContact')}</h4>
                    <p className="text-gray-700">{childProfile.emergency_contact}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('sections.keyInformation.fields.emergencyPhone')}</h4>
                    <p className="text-gray-700">{childProfile.emergency_phone}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">{t('sections.keyInformation.fields.insuranceProvider')}</h4>
                    <p className="text-gray-700">{childProfile.insurance_provider || t('sections.keyInformation.notProvided')}</p>
                  </div>
                </div>

                {childProfile.additional_notes && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('sections.keyInformation.additionalNotes')}</h4>
                    <p className="text-gray-700 leading-relaxed">{childProfile.additional_notes}</p>
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
              {childProfile ? t('sections.keyInformation.editChildProfile') : t('sections.keyInformation.createChildProfile')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-special-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-special-800">{t('sections.keyInformation.basicInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('sections.keyInformation.fields.fullName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.fullName')} {...field} />
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
                          <FormLabel>{t('sections.keyInformation.fields.dateOfBirth')}</FormLabel>
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
                          <FormLabel>{t('sections.keyInformation.fields.healthCardNumberOptional')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.healthCardNumber')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-red-800">{t('sections.keyInformation.medicalInfo')}</h3>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="medicalConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('sections.keyInformation.fields.medicalConditions')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('sections.keyInformation.placeholders.medicalConditions')}
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
                          <FormLabel>{t('sections.keyInformation.fields.allergies')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('sections.keyInformation.placeholders.allergies')}
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
                  <h3 className="text-lg font-medium mb-4 text-green-800">{t('sections.keyInformation.preferencesPersonality')}</h3>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="likes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('sections.keyInformation.fields.likes')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('sections.keyInformation.placeholders.likes')}
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
                          <FormLabel>{t('sections.keyInformation.fields.dislikes')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('sections.keyInformation.placeholders.dislikes')}
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
                          <FormLabel>{t('sections.keyInformation.fields.doNots')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('sections.keyInformation.placeholders.doNots')}
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
                  <h3 className="text-lg font-medium mb-4 text-gray-800">{t('sections.keyInformation.contactEmergency')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('sections.keyInformation.fields.address')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.address')} {...field} />
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
                          <FormLabel>{t('sections.keyInformation.fields.phoneNumber')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.phoneNumber')} {...field} />
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
                          <FormLabel>{t('sections.keyInformation.fields.emailOptional')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('sections.keyInformation.placeholders.email')} {...field} />
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
                          <FormLabel>{t('sections.keyInformation.fields.emergencyContact')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.emergencyContact')} {...field} />
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
                          <FormLabel>{t('sections.keyInformation.fields.emergencyPhone')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.emergencyPhone')} {...field} />
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
                          <FormLabel>{t('sections.keyInformation.fields.insuranceProviderOptional')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.insuranceProvider')} {...field} />
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
                          <FormLabel>{t('sections.keyInformation.fields.insuranceNumberOptional')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('sections.keyInformation.placeholders.insuranceNumber')} {...field} />
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
                      <FormLabel>{t('sections.keyInformation.fields.additionalNotesOptional')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('sections.keyInformation.placeholders.additionalNotes')}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  {isEditing && childProfile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="bg-special-600 hover:bg-special-700 flex items-center gap-2"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <Save size={16} />
                    )}
                    {t('sections.keyInformation.saveChanges')}
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
