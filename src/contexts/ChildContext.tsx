
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

export type ChildAccessRole = "owner" | "caregiver" | "viewer";

export interface ChildWithAccess extends Child {
  accessRole: ChildAccessRole;
}

interface ChildContextType {
  children: ChildWithAccess[];
  activeChild: ChildWithAccess | null;
  setActiveChildId: (id: string) => void;
  isLoading: boolean;
  addChild: (name: string) => Promise<void>;
  updateChild: (id: string, name: string) => Promise<void>;
  updateChildAvatar: (id: string, avatarUrl: string | null) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  isOwner: (childId?: string) => boolean;
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
  const [childList, setChildList] = useState<ChildWithAccess[]>([]);
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
      // Fetch children the user has access to via child_access
      const { data: accessData, error: accessError } = await supabase
        .from('child_access')
        .select('child_id, role')
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      if (!accessData || accessData.length === 0) {
        setChildList([]);
        setActiveChildIdState(null);
        setIsLoading(false);
        return;
      }

      const childIds = accessData.map(a => a.child_id);
      const accessMap = new Map(accessData.map(a => [a.child_id, a.role as ChildAccessRole]));

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .in('id', childIds)
        .order('created_at', { ascending: true });

      if (childrenError) throw childrenError;

      const kids: ChildWithAccess[] = (childrenData || []).map(c => ({
        ...c,
        accessRole: accessMap.get(c.id) || 'viewer',
      }));

      setChildList(kids);

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

      // The trigger auto-creates owner access; refetch to get full data
      await fetchChildren();
      setActiveChildId(data.id);
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

  const updateChildAvatar = async (id: string, avatarUrl: string | null) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ avatar_url: avatarUrl })
        .eq('id', id);

      if (error) throw error;

      setChildList(prev => prev.map(c => c.id === id ? { ...c, avatar_url: avatarUrl } : c));
      toast({ title: "Avatar updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const isOwner = (childId?: string) => {
    const id = childId || activeChildId;
    if (!id) return false;
    const child = childList.find(c => c.id === id);
    return child?.accessRole === 'owner';
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
      updateChildAvatar,
      deleteChild,
      refetch: fetchChildren,
      isOwner,
    }}>
      {childrenProp}
    </ChildContext.Provider>
  );
};
