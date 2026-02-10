
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Save, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Plus, 
  Clock, 
  Calendar as CalendarIcon,
  Pill
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  purpose: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  instructions: z.string().optional(),
  prescribedBy: z.string().optional(),
  pharmacy: z.string().optional(),
  refillDate: z.string().optional(),
  sideEffects: z.string().optional(),
});

type Medication = z.infer<typeof medicationSchema>;

const MedicationsList = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<Medication>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      purpose: "",
      startDate: "",
      endDate: "",
      instructions: "",
      prescribedBy: "",
      pharmacy: "",
      refillDate: "",
      sideEffects: "",
    },
  });

  const onSubmit = (values: Medication) => {
    if (editingIndex !== null) {
      const updatedMedications = [...medications];
      updatedMedications[editingIndex] = values;
      setMedications(updatedMedications);
      
      toast({
        title: "Medication updated",
        description: `${values.name} has been successfully updated.`,
      });
    } else {
      setMedications([...medications, values]);
      
      toast({
        title: "Medication added",
        description: `${values.name} has been successfully added to your list.`,
      });
    }
    
    form.reset();
    setEditingIndex(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (index: number) => {
    const medication = medications[index];
    form.reset(medication);
    setEditingIndex(index);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
    
    toast({
      title: "Medication removed",
      description: "The medication has been removed from your list.",
    });
  };

  const resetForm = () => {
    form.reset();
    setEditingIndex(null);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center">
            <Pill className="h-6 w-6 text-special-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Medications</h2>
            <p className="text-muted-foreground">
              Manage prescribed medications and schedules
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-special-600 hover:bg-special-700 text-white px-6 py-3 text-base font-medium rounded-lg shadow-sm transition-all hover:shadow-md"
                onClick={resetForm}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Medication
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-semibold">
                {editingIndex !== null ? "Edit Medication" : "Add New Medication"}
              </DialogTitle>
              <p className="text-muted-foreground">
                Fill in the medication details below. Required fields are marked with *
              </p>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Medication Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Lisinopril" 
                              className="mt-1 h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Dosage *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 10mg, 1 tablet" 
                              className="mt-1 h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">How Often *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="mt-1 h-11">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="once_daily">Once Daily</SelectItem>
                                <SelectItem value="twice_daily">Twice Daily</SelectItem>
                                <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                                <SelectItem value="four_times_daily">Four Times Daily</SelectItem>
                                <SelectItem value="every_morning">Every Morning</SelectItem>
                                <SelectItem value="every_night">Every Night</SelectItem>
                                <SelectItem value="as_needed">As Needed</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="other">Other (Specify in Instructions)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Purpose</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Blood pressure, Pain relief" 
                              className="mt-1 h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Healthcare Provider Section */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Healthcare Provider</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="prescribedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Prescribed By</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Dr. Smith, Pediatrician" 
                              className="mt-1 h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pharmacy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Pharmacy</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., CVS Pharmacy, Main St" 
                              className="mt-1 h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Schedule & Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="date" 
                                className="mt-1 h-11 pr-10"
                                {...field} 
                              />
                              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">End Date (if applicable)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="date" 
                                className="mt-1 h-11 pr-10"
                                {...field} 
                              />
                              <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="refillDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Next Refill Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="date" 
                                className="mt-1 h-11 pr-10"
                                {...field} 
                              />
                              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="bg-amber-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Additional Information</h3>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., Take with food, avoid grapefruit, give 30 minutes before meals"
                              className="mt-1 min-h-[100px] resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sideEffects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Known Side Effects or Reactions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any known side effects, allergic reactions, or things to watch for"
                              className="mt-1 min-h-[100px] resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter className="gap-3 pt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="px-6">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    className="bg-special-600 hover:bg-special-700 text-white px-8"
                  >
                    {editingIndex !== null ? "Update Medication" : "Add Medication"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
          {medications.length > 0 && (
            <ExportEmailButtons
              exportFunctionName="export-medications"
              emailFunctionName="send-medications"
              exportFilename="medications-list.html"
              label="Medications List"
            />
          )}
        </div>
      </div>

      {medications.length > 0 ? (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-special-50 to-blue-50 border-b">
            <CardTitle className="text-xl font-semibold">Your Medications</CardTitle>
            <CardDescription className="text-base">
              Currently tracking {medications.length} medication{medications.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 py-4">Medication</TableHead>
                    <TableHead className="font-semibold text-gray-700">Dosage</TableHead>
                    <TableHead className="font-semibold text-gray-700">Frequency</TableHead>
                    <TableHead className="font-semibold text-gray-700">Purpose</TableHead>
                    <TableHead className="font-semibold text-gray-700">Refill Date</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((medication, index) => {
                    const formatFrequency = (freq: string) => {
                      const mapping: Record<string, string> = {
                        once_daily: "Once Daily",
                        twice_daily: "Twice Daily",
                        three_times_daily: "Three Times Daily",
                        four_times_daily: "Four Times Daily",
                        every_morning: "Every Morning",
                        every_night: "Every Night",
                        as_needed: "As Needed",
                        weekly: "Weekly",
                        monthly: "Monthly",
                        other: "Custom Schedule",
                      };
                      return mapping[freq] || freq;
                    };
                    
                    const needsRefill = medication.refillDate && 
                      new Date(medication.refillDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
                    
                    return (
                      <TableRow key={index} className="border-b hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium py-4 text-gray-900">{medication.name}</TableCell>
                        <TableCell className="text-gray-700">{medication.dosage}</TableCell>
                        <TableCell className="text-gray-700">{formatFrequency(medication.frequency)}</TableCell>
                        <TableCell className="text-gray-700">{medication.purpose || "-"}</TableCell>
                        <TableCell>
                          {medication.refillDate ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700">
                                {new Date(medication.refillDate).toLocaleDateString()}
                              </span>
                              {needsRefill && (
                                <Badge variant="destructive" className="text-xs">
                                  Refill Soon
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => handleEdit(index)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-0 bg-white text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="bg-special-50 rounded-full p-6 mb-6">
                <Pill className="h-12 w-12 text-special-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">No medications added yet</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Keep track of all medications, dosages, and schedules in one organized place. 
                Start by adding your first medication.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-special-600 hover:bg-special-700 text-white px-8 py-3 text-base font-medium rounded-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Medication
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationsList;
