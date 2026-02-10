
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Child {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ChildContextType {
  children: Child[];
  activeChild: Child | null;
  setActiveChildId: (id: string) => void;
  isLoading: boolean;
  addChild: (name: string) => Promise<void>;
  updateChild: (id: string, name: string) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const useChild = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error("useChild must be used within a ChildProvider");
  }
  return context;
};

export const ChildProvider = ({ children: childrenProp }: { children: ReactNode }) => {
  const [childList, setChildList] = useState<Child[]>([]);
  const [activeChildId, setActiveChildIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChildren = async () => {
    if (!user) {
      setChildList([]);
      setActiveChildIdState(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const kids = (data || []) as Child[];
      setChildList(kids);

      // Restore active child from localStorage or pick first
      const storedId = localStorage.getItem(`activeChildId_${user.id}`);
      const validStored = kids.find(k => k.id === storedId);
      if (validStored) {
        setActiveChildIdState(validStored.id);
      } else if (kids.length > 0) {
        setActiveChildIdState(kids[0].id);
      } else {
        setActiveChildIdState(null);
      }
    } catch (error: any) {
      console.error("Error fetching children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const setActiveChildId = (id: string) => {
    setActiveChildIdState(id);
    if (user) {
      localStorage.setItem(`activeChildId_${user.id}`, id);
    }
  };

  const addChild = async (name: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('children')
        .insert([{ user_id: user.id, name }])
        .select()
        .single();

      if (error) throw error;

      const newChild = data as Child;
      setChildList(prev => [...prev, newChild]);
      setActiveChildId(newChild.id);
      toast({ title: "Child added", description: `${name} has been added.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateChild = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setChildList(prev => prev.map(c => c.id === id ? { ...c, name } : c));
      toast({ title: "Child updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteChild = async (id: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const remaining = childList.filter(c => c.id !== id);
      setChildList(remaining);
      if (activeChildId === id) {
        setActiveChildIdState(remaining[0]?.id || null);
      }
      toast({ title: "Child removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const activeChild = childList.find(c => c.id === activeChildId) || null;

  return (
    <ChildContext.Provider value={{
      children: childList,
      activeChild,
      setActiveChildId,
      isLoading,
      addChild,
      updateChild,
      deleteChild,
      refetch: fetchChildren,
    }}>
      {childrenProp}
    </ChildContext.Provider>
  );
};
