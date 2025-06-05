
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  prescriber?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMedications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching medications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{ ...medication, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setMedications(prev => [data, ...prev]);
      toast({
        title: "Medication added",
        description: "Successfully added new medication",
      });
    } catch (error: any) {
      toast({
        title: "Error adding medication",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setMedications(prev => prev.map(med => med.id === id ? data : med));
      toast({
        title: "Medication updated",
        description: "Successfully updated medication",
      });
    } catch (error: any) {
      toast({
        title: "Error updating medication",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMedications(prev => prev.filter(med => med.id !== id));
      toast({
        title: "Medication deleted",
        description: "Successfully deleted medication",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting medication",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [user]);

  return {
    medications,
    isLoading,
    addMedication,
    updateMedication,
    deleteMedication,
    refetch: fetchMedications,
  };
};
