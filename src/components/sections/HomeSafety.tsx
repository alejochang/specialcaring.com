import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield, Home, Phone, AlertTriangle, Eye, Lock, Thermometer, Lightbulb, Camera,
  Heart, Zap, Car, Baby, FireExtinguisher, Bell, Wrench, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

const HomeSafety = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();
  const queryKey = ['homeSafetyChecks', activeChild?.id];

  const { data: completedChecks = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_safety_checks')
        .select('check_id')
        .eq('child_id', activeChild!.id);
      if (error) throw error;
      return (data || []).map((d: any) => d.check_id) as string[];
    },
    enabled: !!user && !!activeChild,
  });

  const toggleMutation = useMutation({
    mutationFn: async (checkId: string) => {
      const isCompleted = completedChecks.includes(checkId);
      if (isCompleted) {
        const { error } = await supabase.from('home_safety_checks').delete()
          .eq('check_id', checkId).eq('created_by', user!.id).eq('child_id', activeChild!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('home_safety_checks')
          .insert([{ created_by: user!.id, child_id: activeChild!.id, check_id: checkId }]);
        if (error) throw error;
      }
      return checkId;
    },
    onMutate: async (checkId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData<string[]>(queryKey, (old = []) =>
        old.includes(checkId) ? old.filter(id => id !== checkId) : [...old, checkId]
      );
      return { previous };
    },
    onError: (_error: any, _checkId, context: any) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({ title: t('toast.error'), description: _error.message, variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleCheck = (checkId: string) => {
    if (!user || !activeChild) return;
    toggleMutation.mutate(checkId);
  };

  const safetyAreas = useMemo(() => [
    {
      id: "emergency",
      title: t('sections.homeSafety.safetyAreas.emergency.title'),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: t('sections.homeSafety.safetyAreas.emergency.description')
    },
    {
      id: "medical",
      title: t('sections.homeSafety.safetyAreas.medical.title'),
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: t('sections.homeSafety.safetyAreas.medical.description')
    },
    {
      id: "physical",
      title: t('sections.homeSafety.safetyAreas.physical.title'),
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: t('sections.homeSafety.safetyAreas.physical.description')
    },
    {
      id: "monitoring",
      title: t('sections.homeSafety.safetyAreas.monitoring.title'),
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: t('sections.homeSafety.safetyAreas.monitoring.description')
    }
  ], [t]);

  const emergencyChecklist = useMemo(() => [
    { id: "emergency-contacts", text: t('sections.homeSafety.emergencyChecklist.emergencyContacts') },
    { id: "medical-info", text: t('sections.homeSafety.emergencyChecklist.medicalInfo') },
    { id: "evacuation-plan", text: t('sections.homeSafety.emergencyChecklist.evacuationPlan') },
    { id: "emergency-kit", text: t('sections.homeSafety.emergencyChecklist.emergencyKit') },
    { id: "backup-power", text: t('sections.homeSafety.emergencyChecklist.backupPower') },
    { id: "communication-plan", text: t('sections.homeSafety.emergencyChecklist.communicationPlan') }
  ], [t]);

  const medicalSafety = useMemo(() => [
    { id: "med-storage", text: t('sections.homeSafety.medicalSafety.medStorage') },
    { id: "equipment-check", text: t('sections.homeSafety.medicalSafety.equipmentCheck') },
    { id: "allergy-alerts", text: t('sections.homeSafety.medicalSafety.allergyAlerts') },
    { id: "first-aid", text: t('sections.homeSafety.medicalSafety.firstAid') },
    { id: "medical-devices", text: t('sections.homeSafety.medicalSafety.medicalDevices') },
    { id: "therapy-equipment", text: t('sections.homeSafety.medicalSafety.therapyEquipment') }
  ], [t]);

  const physicalEnvironment = useMemo(() => [
    { id: "sharp-objects", text: t('sections.homeSafety.physicalEnvironment.sharpObjects') },
    { id: "outlets-covered", text: t('sections.homeSafety.physicalEnvironment.outletsCovered') },
    { id: "stairs-gates", text: t('sections.homeSafety.physicalEnvironment.stairsGates') },
    { id: "flooring-safe", text: t('sections.homeSafety.physicalEnvironment.flooringSafe') },
    { id: "furniture-secured", text: t('sections.homeSafety.physicalEnvironment.furnitureSecured') },
    { id: "bathroom-safety", text: t('sections.homeSafety.physicalEnvironment.bathroomSafety') },
    { id: "kitchen-safety", text: t('sections.homeSafety.physicalEnvironment.kitchenSafety') },
    { id: "sensory-considerations", text: t('sections.homeSafety.physicalEnvironment.sensoryConsiderations') }
  ], [t]);

  const monitoringSystems = useMemo(() => [
    { id: "door-alarms", text: t('sections.homeSafety.monitoringSystems.doorAlarms') },
    { id: "baby-monitors", text: t('sections.homeSafety.monitoringSystems.babyMonitors') },
    { id: "wearable-devices", text: t('sections.homeSafety.monitoringSystems.wearableDevices') },
    { id: "motion-sensors", text: t('sections.homeSafety.monitoringSystems.motionSensors') },
    { id: "call-system", text: t('sections.homeSafety.monitoringSystems.callSystem') },
    { id: "caregiver-schedule", text: t('sections.homeSafety.monitoringSystems.caregiverSchedule') }
  ], [t]);

  const ChecklistSection = ({ title, items }: { title: string, items: any[] }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-lg mb-4">{title}</h4>
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <button
            onClick={() => canEdit && toggleCheck(item.id)}
            disabled={!canEdit}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              completedChecks.includes(item.id) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
            } ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {completedChecks.includes(item.id) && <CheckCircle className="h-3 w-3" />}
          </button>
          <span className={`flex-1 text-sm ${completedChecks.includes(item.id) ? 'line-through text-gray-500' : ''}`}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );

  const totalItems = emergencyChecklist.length + medicalSafety.length + physicalEnvironment.length + monitoringSystems.length;
  const completionPercentage = Math.round((completedChecks.length / totalItems) * 100);

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">{t('sections.homeSafety.title')}</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>{t('common.noChildProfile')}</AlertDescription></Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-special-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('sections.homeSafety.title')}</h1>
        <p className="text-muted-foreground">
          {t('sections.homeSafety.subtitle')}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">{t('sections.homeSafety.completionLabel', { percent: completionPercentage })}</span>
          </div>
          <Badge variant="outline">
            {t('sections.homeSafety.itemsCompleted', { completed: completedChecks.length, total: totalItems })}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="emergency" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {safetyAreas.map((area) => (
                <TabsTrigger key={area.id} value={area.id} className="flex items-center gap-2">
                  <area.icon className={`h-4 w-4 ${area.color}`} />
                  <span className="hidden sm:inline">{area.title.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <CardTitle>{t('sections.homeSafety.safetyAreas.emergency.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('sections.homeSafety.safetyAreas.emergency.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection
                    title={t('sections.homeSafety.emergencyChecklist.title')}
                    items={emergencyChecklist}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <CardTitle>{t('sections.homeSafety.safetyAreas.medical.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('sections.homeSafety.safetyAreas.medical.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection
                    title={t('sections.homeSafety.medicalSafety.title')}
                    items={medicalSafety}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="physical">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <CardTitle>{t('sections.homeSafety.safetyAreas.physical.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('sections.homeSafety.safetyAreas.physical.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection
                    title={t('sections.homeSafety.physicalEnvironment.title')}
                    items={physicalEnvironment}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <CardTitle>{t('sections.homeSafety.safetyAreas.monitoring.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('sections.homeSafety.safetyAreas.monitoring.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection
                    title={t('sections.homeSafety.monitoringSystems.title')}
                    items={monitoringSystems}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-special-600" />
                <CardTitle>{t('sections.homeSafety.emergencyContactCards')}</CardTitle>
              </div>
              <CardDescription>{t('sections.homeSafety.quickAccessNumbers')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-red-800">911</div>
                  <div className="text-sm text-red-600">{t('sections.homeSafety.emergencyServices')}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-800">{t('sections.homeSafety.poisonControl')}</div>
                  <div className="text-sm text-blue-600">1-800-222-1222</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">{t('sections.homeSafety.primaryDoctor')}</div>
                  <div className="text-sm text-green-600">{t('sections.homeSafety.addDoctorNumber')}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800">{t('sections.homeSafety.specialist')}</div>
                  <div className="text-sm text-purple-600">{t('sections.homeSafety.addSpecialistNumber')}</div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                {t('sections.homeSafety.manageEmergencyContacts')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <CardTitle>{t('sections.homeSafety.safetyTipsTitle')}</CardTitle>
              </div>
              <CardDescription>{t('sections.homeSafety.safetyTipsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('sections.homeSafety.safetyTip1')}
                </AlertDescription>
              </Alert>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {t('sections.homeSafety.safetyTip2')}
                </AlertDescription>
              </Alert>
              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  {t('sections.homeSafety.safetyTip3')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-special-600" />
                <CardTitle>{t('sections.homeSafety.safetyDocumentation')}</CardTitle>
              </div>
              <CardDescription>{t('sections.homeSafety.safetyDocsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FireExtinguisher className="h-4 w-4 mr-2" />
                {t('sections.homeSafety.fireSafetyPlan')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Car className="h-4 w-4 mr-2" />
                {t('sections.homeSafety.transportationSafety')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                {t('sections.homeSafety.emergencyProcedures')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="h-4 w-4 mr-2" />
                {t('sections.homeSafety.equipmentMaintenanceLog')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeSafety;
