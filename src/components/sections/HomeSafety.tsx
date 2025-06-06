
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Home, 
  Phone, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Thermometer, 
  Lightbulb, 
  Camera,
  Heart,
  Zap,
  Car,
  Baby,
  FireExtinguisher,
  Bell,
  Wrench,
  CheckCircle
} from "lucide-react";

const HomeSafety = () => {
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);

  const toggleCheck = (checkId: string) => {
    setCompletedChecks(prev => 
      prev.includes(checkId) 
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId]
    );
  };

  const safetyAreas = [
    {
      id: "emergency",
      title: "Emergency Preparedness",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Essential emergency plans and contacts"
    },
    {
      id: "medical",
      title: "Medical Safety",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "Medical equipment and medication safety"
    },
    {
      id: "physical",
      title: "Physical Environment",
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Home modifications and accessibility"
    },
    {
      id: "monitoring",
      title: "Monitoring & Supervision",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Supervision systems and safety monitoring"
    }
  ];

  const emergencyChecklist = [
    { id: "emergency-contacts", text: "Emergency contact list posted in visible location" },
    { id: "medical-info", text: "Medical information and allergies clearly documented" },
    { id: "evacuation-plan", text: "Evacuation plan adapted for special needs" },
    { id: "emergency-kit", text: "Emergency kit with extra medications and supplies" },
    { id: "backup-power", text: "Backup power for essential medical equipment" },
    { id: "communication-plan", text: "Communication plan for non-verbal individuals" }
  ];

  const medicalSafety = [
    { id: "med-storage", text: "Medications stored safely and securely" },
    { id: "equipment-check", text: "Medical equipment regularly inspected and maintained" },
    { id: "allergy-alerts", text: "Allergy information visible throughout home" },
    { id: "first-aid", text: "First aid kit stocked and accessible" },
    { id: "medical-devices", text: "Medical devices properly calibrated and charged" },
    { id: "therapy-equipment", text: "Therapy equipment safely stored when not in use" }
  ];

  const physicalEnvironment = [
    { id: "sharp-objects", text: "Sharp objects and hazardous items secured" },
    { id: "outlets-covered", text: "Electrical outlets covered or secured" },
    { id: "stairs-gates", text: "Safety gates installed on stairs if needed" },
    { id: "flooring-safe", text: "Flooring is non-slip and obstacle-free" },
    { id: "furniture-secured", text: "Heavy furniture anchored to walls" },
    { id: "bathroom-safety", text: "Bathroom equipped with safety features" },
    { id: "kitchen-safety", text: "Kitchen appliances and utensils secured" },
    { id: "sensory-considerations", text: "Environment adapted for sensory needs" }
  ];

  const monitoringSystems = [
    { id: "door-alarms", text: "Door and window alarms installed if needed" },
    { id: "baby-monitors", text: "Audio/video monitoring system in place" },
    { id: "wearable-devices", text: "GPS or tracking devices for wandering prevention" },
    { id: "motion-sensors", text: "Motion sensors in critical areas" },
    { id: "call-system", text: "Emergency call system accessible" },
    { id: "caregiver-schedule", text: "Clear supervision schedule maintained" }
  ];

  const ChecklistSection = ({ title, items, iconColor }: { title: string, items: any[], iconColor: string }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-lg mb-4">{title}</h4>
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <button
            onClick={() => toggleCheck(item.id)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              completedChecks.includes(item.id)
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            }`}
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

  const EmergencyContactsCard = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-special-600" />
          <CardTitle>Emergency Contacts</CardTitle>
        </div>
        <CardDescription>Quick access to important numbers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="font-medium text-red-800">911</div>
            <div className="text-sm text-red-600">Emergency Services</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-800">Poison Control</div>
            <div className="text-sm text-blue-600">1-800-222-1222</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-800">Primary Doctor</div>
            <div className="text-sm text-green-600">Add your doctor's number</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-800">Specialist</div>
            <div className="text-sm text-purple-600">Add specialist's number</div>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          <Phone className="h-4 w-4 mr-2" />
          Manage Emergency Contacts
        </Button>
      </CardContent>
    </Card>
  );

  const SafetyTipsCard = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <CardTitle>Safety Tips</CardTitle>
        </div>
        <CardDescription>Important reminders for daily safety</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Always supervise medication administration and document times
          </AlertDescription>
        </Alert>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Check that all safety devices are functioning weekly
          </AlertDescription>
        </Alert>
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            Maintain constant appropriate supervision based on individual needs
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const completionPercentage = Math.round(
    (completedChecks.length / (emergencyChecklist.length + medicalSafety.length + physicalEnvironment.length + monitoringSystems.length)) * 100
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Home Safety</h1>
        <p className="text-muted-foreground">
          Comprehensive safety planning for special needs caregiving
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Safety Checklist: {completionPercentage}% Complete</span>
          </div>
          <Badge variant="outline">
            {completedChecks.length} of {emergencyChecklist.length + medicalSafety.length + physicalEnvironment.length + monitoringSystems.length} items completed
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
                    <CardTitle>Emergency Preparedness</CardTitle>
                  </div>
                  <CardDescription>
                    Ensure you're prepared for emergency situations with proper planning and equipment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection 
                    title="Emergency Readiness Checklist" 
                    items={emergencyChecklist} 
                    iconColor="text-red-600" 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <CardTitle>Medical Safety</CardTitle>
                  </div>
                  <CardDescription>
                    Maintain safe storage and handling of medications and medical equipment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection 
                    title="Medical Safety Checklist" 
                    items={medicalSafety} 
                    iconColor="text-pink-600" 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="physical">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <CardTitle>Physical Environment</CardTitle>
                  </div>
                  <CardDescription>
                    Create a safe physical environment adapted to individual needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection 
                    title="Physical Safety Checklist" 
                    items={physicalEnvironment} 
                    iconColor="text-blue-600" 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <CardTitle>Monitoring & Supervision</CardTitle>
                  </div>
                  <CardDescription>
                    Implement appropriate monitoring systems for safety and security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChecklistSection 
                    title="Monitoring Systems Checklist" 
                    items={monitoringSystems} 
                    iconColor="text-green-600" 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <EmergencyContactsCard />
          <SafetyTipsCard />
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-special-600" />
                <CardTitle>Safety Documentation</CardTitle>
              </div>
              <CardDescription>Keep important safety documents updated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FireExtinguisher className="h-4 w-4 mr-2" />
                Fire Safety Plan
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Car className="h-4 w-4 mr-2" />
                Transportation Safety
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Emergency Procedures
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="h-4 w-4 mr-2" />
                Equipment Maintenance Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeSafety;
