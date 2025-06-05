
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MedicalContact {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export const useMedicalContacts = () => {
  const [contacts, setContacts] = useState<MedicalContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('medical_contacts')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching medical contacts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addContact = async (contact: Omit<MedicalContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('medical_contacts')
        .insert([{ ...contact, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => [data, ...prev]);
      toast({
        title: "Contact added",
        description: "Successfully added new medical contact",
      });
    } catch (error: any) {
      toast({
        title: "Error adding contact",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateContact = async (id: string, updates: Partial<MedicalContact>) => {
    try {
      const { data, error } = await supabase
        .from('medical_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => prev.map(contact => contact.id === id ? data : contact));
      toast({
        title: "Contact updated",
        description: "Successfully updated medical contact",
      });
    } catch (error: any) {
      toast({
        title: "Error updating contact",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medical_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast({
        title: "Contact deleted",
        description: "Successfully deleted medical contact",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
};
