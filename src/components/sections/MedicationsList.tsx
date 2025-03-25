
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
  Calendar as CalendarIcon 
} from "lucide-react";

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
      // Update existing medication
      const updatedMedications = [...medications];
      updatedMedications[editingIndex] = values;
      setMedications(updatedMedications);
      
      toast({
        title: "Medication updated",
        description: `${values.name} has been successfully updated.`,
      });
    } else {
      // Add new medication
      setMedications([...medications, values]);
      
      toast({
        title: "Medication added",
        description: `${values.name} has been successfully added to your list.`,
      });
    }
    
    // Reset form and close dialog
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medications List</h2>
          <p className="text-muted-foreground">
            Manage prescribed medications and schedules
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-caregiver-600 hover:bg-caregiver-700 flex items-center gap-2"
              onClick={resetForm}
            >
              <Plus size={16} />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? "Edit Medication" : "Add New Medication"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lisinopril" {...field} />
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
                        <FormLabel>Dosage*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10mg" {...field} />
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
                        <FormLabel>Frequency*</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
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
                        <FormLabel>Purpose</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Blood Pressure Management" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input type="date" {...field} />
                            <CalendarIcon className="ml-2 text-muted-foreground h-4 w-4" />
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
                        <FormLabel>End Date (if applicable)</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input type="date" {...field} />
                            <CalendarIcon className="ml-2 text-muted-foreground h-4 w-4" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prescribedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prescribed By</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Dr. Smith" {...field} />
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
                        <FormLabel>Pharmacy</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CVS Pharmacy" {...field} />
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
                        <FormLabel>Next Refill Date</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input type="date" {...field} />
                            <Clock className="ml-2 text-muted-foreground h-4 w-4" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Take with food, avoid grapefruit" 
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
                  name="sideEffects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Known Side Effects</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List any known side effects or reactions" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-caregiver-600 hover:bg-caregiver-700">
                    {editingIndex !== null ? "Update Medication" : "Add Medication"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length > 0 ? (
        <Card className="shadow-sm border border-border bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Medications</CardTitle>
            <CardDescription>
              Currently tracking {medications.length} medication{medications.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Refill Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((medication, index) => {
                    // Format frequency for display
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
                    
                    // Check if refill is needed soon (within 7 days)
                    const needsRefill = medication.refillDate && 
                      new Date(medication.refillDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{medication.name}</TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>{formatFrequency(medication.frequency)}</TableCell>
                        <TableCell>{medication.purpose || "-"}</TableCell>
                        <TableCell>
                          {medication.refillDate ? (
                            <div className="flex items-center gap-2">
                              {new Date(medication.refillDate).toLocaleDateString()}
                              {needsRefill && (
                                <Badge variant="destructive" className="text-xs">
                                  Refill Soon
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(index)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
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
        <Card className="shadow-sm border border-border bg-white text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="bg-muted rounded-full p-3 mb-4">
                <PlusCircle size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No medications added yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Start tracking medications by clicking the "Add Medication" button above.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-caregiver-600 hover:bg-caregiver-700"
              >
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
