
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Phone, Globe, Package, Calendar } from "lucide-react";
import { format } from "date-fns";

type SupplierCategory = 'Medicine' | 'Supplement' | 'Supply' | 'Other';

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

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState<SupplierEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: 'Medicine' as SupplierCategory,
    item_name: '',
    dosage_or_size: '',
    brand_or_strength: '',
    provider_name: '',
    contact_phone: '',
    address: '',
    website: '',
    ordering_instructions: '',
    notes: '',
    inventory_threshold: '',
    last_order_date: '',
  });

  useEffect(() => {
    if (user && activeChild) {
      fetchSuppliers();
    }
  }, [user, activeChild?.id]);

  const fetchSuppliers = async () => {
    if (!activeChild) return;
    try {
      const { data, error } = await (supabase as any)
        .from('suppliers')
        .select('*')
        .eq('child_id', activeChild.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type-cast the data to ensure proper typing
      const typedData: SupplierEntry[] = (data || []).map((item: any) => ({
        ...item,
        category: item.category as SupplierCategory
      }));
      
      setSuppliers(typedData);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Medicine',
      item_name: '',
      dosage_or_size: '',
      brand_or_strength: '',
      provider_name: '',
      contact_phone: '',
      address: '',
      website: '',
      ordering_instructions: '',
      notes: '',
      inventory_threshold: '',
      last_order_date: '',
    });
    setEditingSupplier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (!activeChild) return;
      const supplierData = {
        ...formData,
        user_id: user.id,
        child_id: activeChild.id,
        inventory_threshold: formData.inventory_threshold ? parseInt(formData.inventory_threshold) : null,
        brand_or_strength: formData.brand_or_strength || null,
        address: formData.address || null,
        website: formData.website || null,
        ordering_instructions: formData.ordering_instructions || null,
        notes: formData.notes || null,
        last_order_date: formData.last_order_date || null,
      };

      if (editingSupplier) {
        const { error } = await (supabase as any)
          .from('suppliers')
          .update(supplierData)
          .eq('id', editingSupplier.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
      } else {
        const { error } = await (supabase as any)
          .from('suppliers')
          .insert([supplierData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Supplier added successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({
        title: "Error",
        description: "Failed to save supplier",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (supplier: SupplierEntry) => {
    setEditingSupplier(supplier);
    setFormData({
      category: supplier.category,
      item_name: supplier.item_name,
      dosage_or_size: supplier.dosage_or_size,
      brand_or_strength: supplier.brand_or_strength || '',
      provider_name: supplier.provider_name,
      contact_phone: supplier.contact_phone,
      address: supplier.address || '',
      website: supplier.website || '',
      ordering_instructions: supplier.ordering_instructions || '',
      notes: supplier.notes || '',
      inventory_threshold: supplier.inventory_threshold?.toString() || '',
      last_order_date: supplier.last_order_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const { error } = await (supabase as any)
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: SupplierCategory) => {
    const colors = {
      Medicine: 'bg-red-100 text-red-800',
      Supplement: 'bg-green-100 text-green-800',
      Supply: 'bg-blue-100 text-blue-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  if (isLoading) {
    return <div>Loading suppliers...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suppliers & Providers</h1>
          <p className="text-muted-foreground">
            Manage suppliers for medicines, supplements, and caregiving supplies
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-special-600 hover:bg-special-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              <DialogDescription>
                {editingSupplier ? 'Update supplier information' : 'Add a new supplier or provider to your list'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: SupplierCategory) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Supplement">Supplement</SelectItem>
                      <SelectItem value="Supply">Supply</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="item_name">Item Name</Label>
                  <Input
                    id="item_name"
                    value={formData.item_name}
                    onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dosage_or_size">Dosage/Size</Label>
                  <Input
                    id="dosage_or_size"
                    value={formData.dosage_or_size}
                    onChange={(e) => setFormData({...formData, dosage_or_size: e.target.value})}
                    placeholder="e.g., 2.4 mL, 50 ct"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="brand_or_strength">Brand/Strength</Label>
                  <Input
                    id="brand_or_strength"
                    value={formData.brand_or_strength}
                    onChange={(e) => setFormData({...formData, brand_or_strength: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider_name">Provider Name</Label>
                  <Input
                    id="provider_name"
                    value={formData.provider_name}
                    onChange={(e) => setFormData({...formData, provider_name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inventory_threshold">Inventory Threshold</Label>
                  <Input
                    id="inventory_threshold"
                    type="number"
                    value={formData.inventory_threshold}
                    onChange={(e) => setFormData({...formData, inventory_threshold: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="last_order_date">Last Order Date</Label>
                <Input
                  id="last_order_date"
                  type="date"
                  value={formData.last_order_date}
                  onChange={(e) => setFormData({...formData, last_order_date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="ordering_instructions">Ordering Instructions</Label>
                <Textarea
                  id="ordering_instructions"
                  value={formData.ordering_instructions}
                  onChange={(e) => setFormData({...formData, ordering_instructions: e.target.value})}
                  placeholder="Special instructions for ordering"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-special-600 hover:bg-special-700">
                  {editingSupplier ? 'Update' : 'Add'} Supplier
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                : "No suppliers match your current search criteria."
              }
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
                      <Badge className={getCategoryColor(supplier.category)}>
                        {supplier.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      {supplier.dosage_or_size}
                      {supplier.brand_or_strength && ` • ${supplier.brand_or_strength}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(supplier.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" 
                         className="text-special-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                  
                  {supplier.last_order_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-special-600" />
                      <span>Last order: {format(new Date(supplier.last_order_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  {supplier.inventory_threshold && (
                    <div className="text-orange-600">
                      Low stock threshold: {supplier.inventory_threshold}
                    </div>
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
    </div>
  );
};

export default SuppliersList;
