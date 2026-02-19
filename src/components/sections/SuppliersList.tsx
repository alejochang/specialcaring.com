
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Phone, Globe, Package, Calendar, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

/* ---------- Zod schema ---------- */
const supplierSchema = z.object({
  category: z.enum(["Medicine", "Supplement", "Supply", "Other"], {
    required_error: "Category is required",
  }),
  item_name: z.string().min(1, "Item name is required"),
  dosage_or_size: z.string().min(1, "Dosage/size is required"),
  brand_or_strength: z.string().optional().default(""),
  provider_name: z.string().min(1, "Provider name is required"),
  contact_phone: z.string().min(1, "Contact phone is required"),
  address: z.string().optional().default(""),
  website: z.string().optional().default(""),
  ordering_instructions: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  inventory_threshold: z.string().optional().default(""),
  last_order_date: z.string().optional().default(""),
});

type SupplierForm = z.infer<typeof supplierSchema>;

type SupplierCategory = "Medicine" | "Supplement" | "Supply" | "Other";

interface SupplierEntry {
  id: string;
  category: SupplierCategory;
  item_name: string;
  dosage_or_size: string;
  brand_or_strength?: string;
  provider_name: string;
  contact_phone: string;
  address?: string;
  website?: string;
  ordering_instructions?: string;
  notes?: string;
  inventory_threshold?: number;
  last_order_date?: string;
  created_at: string;
  updated_at: string;
}

const defaultValues: SupplierForm = {
  category: "Medicine",
  item_name: "",
  dosage_or_size: "",
  brand_or_strength: "",
  provider_name: "",
  contact_phone: "",
  address: "",
  website: "",
  ordering_instructions: "",
  notes: "",
  inventory_threshold: "",
  last_order_date: "",
};

const SuppliersList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  const form = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues,
  });

  /* ---------- Query ---------- */
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("child_id", activeChild!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        category: item.category as SupplierCategory,
      })) as SupplierEntry[];
    },
    enabled: !!user && !!activeChild,
  });

  /* ---------- Mutations ---------- */
  const saveMutation = useMutation({
    mutationFn: async (formValues: SupplierForm) => {
      const supplierData = {
        item_name: formValues.item_name,
        dosage_or_size: formValues.dosage_or_size,
        provider_name: formValues.provider_name,
        contact_phone: formValues.contact_phone,
        category: formValues.category,
        user_id: user!.id,
        child_id: activeChild!.id,
        inventory_threshold: formValues.inventory_threshold ? parseInt(formValues.inventory_threshold) : null,
        brand_or_strength: formValues.brand_or_strength || null,
        address: formValues.address || null,
        website: formValues.website || null,
        ordering_instructions: formValues.ordering_instructions || null,
        notes: formValues.notes || null,
        last_order_date: formValues.last_order_date || null,
      };
      if (editingSupplier) {
        const { error } = await supabase.from("suppliers").update(supplierData).eq("id", editingSupplier.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("suppliers").insert([supplierData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", activeChild?.id] });
      toast({ title: "Success", description: editingSupplier ? "Supplier updated successfully" : "Supplier added successfully" });
      setIsDialogOpen(false);
      setEditingSupplier(null);
      form.reset(defaultValues);
    },
    onError: (error: any) =>
      toast({ title: "Error", description: error.message || "Failed to save supplier", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", activeChild?.id] });
      toast({ title: "Success", description: "Supplier deleted successfully" });
    },
    onError: (error: any) =>
      toast({ title: "Error", description: error.message || "Failed to delete supplier", variant: "destructive" }),
  });

  /* ---------- Handlers ---------- */
  const onSubmit = (values: SupplierForm) => {
    if (!user || !activeChild) return;
    saveMutation.mutate(values);
  };

  const handleEdit = (supplier: SupplierEntry) => {
    setEditingSupplier(supplier);
    form.reset({
      category: supplier.category,
      item_name: supplier.item_name,
      dosage_or_size: supplier.dosage_or_size,
      brand_or_strength: supplier.brand_or_strength || "",
      provider_name: supplier.provider_name,
      contact_phone: supplier.contact_phone,
      address: supplier.address || "",
      website: supplier.website || "",
      ordering_instructions: supplier.ordering_instructions || "",
      notes: supplier.notes || "",
      inventory_threshold: supplier.inventory_threshold?.toString() || "",
      last_order_date: supplier.last_order_date || "",
    });
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
      setDeletingId(null);
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: SupplierCategory) => {
    const colors = {
      Medicine: "bg-red-100 text-red-800",
      Supplement: "bg-green-100 text-green-800",
      Supply: "bg-blue-100 text-blue-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category];
  };

  /* ---------- Guards ---------- */
  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Suppliers & Providers</h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please select or create a child profile first.</AlertDescription>
        </Alert>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suppliers & Providers</h1>
          <p className="text-muted-foreground">Manage suppliers for medicines, supplements, and caregiving supplies</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {canEdit && (
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingSupplier(null);
                  form.reset(defaultValues);
                }}
                className="bg-special-600 hover:bg-special-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? "Update supplier information" : "Add a new supplier or provider to your list"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Medicine">Medicine</SelectItem>
                            <SelectItem value="Supplement">Supplement</SelectItem>
                            <SelectItem value="Supply">Supply</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="item_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dosage_or_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage/Size</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2.4 mL, 50 ct" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand_or_strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand/Strength</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="provider_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inventory_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventory Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="last_order_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Order Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ordering_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordering Instructions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Special instructions for ordering" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-special-600 hover:bg-special-700">
                    {editingSupplier ? "Update" : "Add"} Supplier
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Medicine">Medicine</SelectItem>
            <SelectItem value="Supplement">Supplement</SelectItem>
            <SelectItem value="Supply">Supply</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No suppliers found</CardTitle>
            <CardDescription>
              {suppliers.length === 0
                ? "Get started by adding your first supplier or provider."
                : "No suppliers match your current search criteria."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{supplier.item_name}</CardTitle>
                      <Badge className={getCategoryColor(supplier.category)}>{supplier.category}</Badge>
                    </div>
                    <CardDescription>
                      {supplier.dosage_or_size}
                      {supplier.brand_or_strength && ` \u2022 ${supplier.brand_or_strength}`}
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeletingId(supplier.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-special-600" />
                    <span className="font-medium">{supplier.provider_name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-special-600" />
                    <span>{supplier.contact_phone}</span>
                  </div>

                  {supplier.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-special-600" />
                      <a
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-special-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}

                  {supplier.last_order_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-special-600" />
                      <span>Last order: {format(new Date(supplier.last_order_date), "MMM d, yyyy")}</span>
                    </div>
                  )}

                  {supplier.inventory_threshold && (
                    <div className="text-orange-600">Low stock threshold: {supplier.inventory_threshold}</div>
                  )}
                </div>

                {supplier.address && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <strong>Address:</strong> {supplier.address}
                  </div>
                )}

                {supplier.ordering_instructions && (
                  <div className="mt-3 text-sm">
                    <strong>Ordering Instructions:</strong> {supplier.ordering_instructions}
                  </div>
                )}

                {supplier.notes && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <strong>Notes:</strong> {supplier.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- Delete Confirmation AlertDialog ---------- */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this supplier entry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuppliersList;
