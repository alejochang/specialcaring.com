
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save, PlusCircle, Pencil, AlertTriangle, Phone, Clock, FileText, Trash2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const protocolSchema = z.object({
  title: z.string().min(1, "Title is required"),
  severity: z.enum(["critical", "urgent", "moderate"]),
  emergencyContacts: z.string().min(1, "Emergency contacts are required"),
  immediateSteps: z.string().min(1, "Immediate steps are required"),
  whenToCall911: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type ProtocolValues = z.infer<typeof protocolSchema>;

interface Protocol extends ProtocolValues {
  id: string;
}

const MedicalEmergencyProtocols = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([
    {
      id: "1",
      title: "Seizure Response",
      severity: "critical" as const,
      emergencyContacts: "911, Dr. Smith: (555) 123-4567, Hospital: (555) 987-6543",
      immediateSteps: "1. Stay calm and stay with the child\n2. Remove any dangerous objects nearby\n3. Place something soft under their head\n4. Turn them on their side if possible\n5. Do NOT put anything in their mouth\n6. Time the seizure duration\n7. Call 911 if seizure lasts longer than 5 minutes",
      whenToCall911: "• Seizure lasts longer than 5 minutes\n• Child has trouble breathing\n• Child is injured during seizure\n• This is their first seizure\n• Child has another seizure soon after the first",
      additionalNotes: "Record details: time started, duration, what child was doing before, any triggers noticed"
    },
    {
      id: "2", 
      title: "Allergic Reaction",
      severity: "urgent" as const,
      emergencyContacts: "911, Pediatrician: (555) 234-5678, EpiPen location: Kitchen drawer",
      immediateSteps: "1. Identify and remove the allergen if possible\n2. Check for EpiPen if severe reaction\n3. Give antihistamine if mild reaction\n4. Monitor breathing and consciousness\n5. Call emergency contacts\n6. Use EpiPen if breathing difficulties or swelling",
      whenToCall911: "• Difficulty breathing or wheezing\n• Swelling of face, lips, or tongue\n• Rapid pulse\n• Dizziness or fainting\n• Severe vomiting or diarrhea",
      additionalNotes: "Always carry EpiPen when going out. Check expiration dates monthly."
    }
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProtocolValues>({
    resolver: zodResolver(protocolSchema),
    defaultValues: {
      title: "",
      severity: "moderate",
      emergencyContacts: "",
      immediateSteps: "",
      whenToCall911: "",
      additionalNotes: "",
    },
  });

  const onSubmit = async (values: ProtocolValues) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingId) {
        setProtocols(prev => prev.map(p => 
          p.id === editingId ? { ...values, id: editingId } : p
        ));
        toast({
          title: "Protocol updated",
          description: "Emergency protocol has been successfully updated.",
        });
      } else {
        const newProtocol: Protocol = {
          ...values,
          id: Date.now().toString(),
        };
        setProtocols(prev => [...prev, newProtocol]);
        toast({
          title: "Protocol added",
          description: "New emergency protocol has been successfully added.",
        });
      }
      
      setIsEditing(false);
      setEditingId(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save protocol. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id);
    form.reset(protocol);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setProtocols(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Protocol deleted",
      description: "Emergency protocol has been removed.",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-200 bg-red-50";
      case "urgent": return "border-orange-200 bg-orange-50";
      case "moderate": return "border-yellow-200 bg-yellow-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "urgent": return <Clock className="h-5 w-5 text-orange-600" />;
      case "moderate": return <FileText className="h-5 w-5 text-yellow-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Emergency Protocols</h2>
          <p className="text-muted-foreground">
            Quick reference guides for managing medical emergencies and critical situations
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(true)}
          className="bg-special-600 hover:bg-special-700 flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add Protocol
        </Button>
      </div>

      <Alert className="mb-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Emergency Reminder</AlertTitle>
        <AlertDescription className="text-red-700">
          In a life-threatening emergency, always call 911 first. These protocols are supplementary guidance and should not replace professional medical advice.
        </AlertDescription>
      </Alert>

      {protocols.length > 0 ? (
        <div className="grid gap-4 mb-6">
          {protocols.map((protocol) => (
            <Card key={protocol.id} className={`${getSeverityColor(protocol.severity)} border-2`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(protocol.severity)}
                    <div>
                      <CardTitle className="text-xl">{protocol.title}</CardTitle>
                      <CardDescription className="capitalize">
                        {protocol.severity} Priority
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(protocol)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(protocol.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-special-600" />
                    <h4 className="font-medium">Emergency Contacts</h4>
                  </div>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded-md">
                    {protocol.emergencyContacts}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-special-600" />
                    <h4 className="font-medium">Immediate Steps</h4>
                  </div>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded-md whitespace-pre-line">
                    {protocol.immediateSteps}
                  </div>
                </div>

                {protocol.whenToCall911 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      <h4 className="font-medium text-red-700">When to Call 911</h4>
                    </div>
                    <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md whitespace-pre-line border border-red-200">
                      {protocol.whenToCall911}
                    </div>
                  </div>
                )}

                {protocol.additionalNotes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-special-600" />
                      <h4 className="font-medium">Additional Notes</h4>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      {protocol.additionalNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Emergency Protocols Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first emergency protocol to be prepared for critical situations.
            </p>
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-special-600 hover:bg-special-700"
            >
              <PlusCircle size={16} className="mr-2" />
              Add Your First Protocol
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Emergency Protocol" : "Add New Emergency Protocol"}
            </DialogTitle>
            <DialogDescription>
              Create detailed step-by-step instructions for handling medical emergencies.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocol Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Seizure Response, Allergic Reaction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity Level</FormLabel>
                      <FormControl>
                        <select {...field} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors">
                          <option value="moderate">Moderate Priority</option>
                          <option value="urgent">Urgent Priority</option>
                          <option value="critical">Critical Priority</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="emergencyContacts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contacts</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List emergency contacts, phone numbers, and any relevant contact information..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="immediateSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Immediate Steps to Take</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List step-by-step instructions for immediate response..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="whenToCall911"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When to Call 911 (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Specify conditions that require immediate emergency services..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional important information, preparation tips, or follow-up actions..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-special-600 hover:bg-special-700 flex items-center gap-2">
                  <Save size={16} />
                  {editingId ? "Update Protocol" : "Save Protocol"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalEmergencyProtocols;
