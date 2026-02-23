
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Child — the unified aggregate root for a child's complete profile.
 * Merges the former `children` + `key_information` tables into one entity.
 * `created_by` is an audit trail field — authorization comes from `child_access`.
 */
export interface Child {
  id: string;
  created_by: string;
  name: string;
  avatar_url: string | null;
  // Profile fields (formerly in key_information)
  full_name: string | null;
  birth_date: string | null;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  health_card_number: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  likes: string | null;
  dislikes: string | null;
  do_nots: string | null;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ChildAccessRole = "owner" | "caregiver" | "viewer";

export interface ChildWithAccess extends Child {
  accessRole: ChildAccessRole;
}

/** Partial profile data for updating child profile fields */
export type ChildProfileUpdate = Partial<Pick<Child,
  | 'name' | 'full_name' | 'birth_date' | 'address' | 'phone_number'
  | 'email' | 'health_card_number' | 'insurance_provider' | 'insurance_number'
  | 'emergency_contact' | 'emergency_phone' | 'medical_conditions'
  | 'allergies' | 'likes' | 'dislikes' | 'do_nots' | 'additional_notes'
>>;

interface ChildContextType {
  children: ChildWithAccess[];
  activeChild: ChildWithAccess | null;
  setActiveChildId: (id: string) => void;
  isLoading: boolean;
  addChild: (name: string) => Promise<void>;
  updateChild: (id: string, name: string) => Promise<void>;
  updateChildProfile: (id: string, data: ChildProfileUpdate) => Promise<void>;
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

      // select('*') now returns full profile data (merged from key_information)
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
        .insert([{ created_by: user.id, name, full_name: name }])
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

  /** Update child's display name (used by sidebar switcher) */
  const updateChild = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .update({ name, full_name: name })
        .eq('id', id);

      if (error) throw error;

      setChildList(prev => prev.map(c => c.id === id ? { ...c, name, full_name: name } : c));
      toast({ title: "Child updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  /** Update child's full profile (used by KeyInformation section) */
  const updateChildProfile = async (id: string, data: ChildProfileUpdate) => {
    try {
      // If full_name is being updated, keep name in sync for display purposes
      const updateData: Record<string, any> = { ...data };
      if (data.full_name && data.full_name !== data.name) {
        updateData.name = data.full_name;
      }

      const { error } = await supabase
        .from('children')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update local state with the new profile data
      setChildList(prev => prev.map(c => c.id === id ? { ...c, ...updateData } : c));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error; // Re-throw so callers can handle
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
      updateChildProfile,
      updateChildAvatar,
      deleteChild,
      refetch: fetchChildren,
      isOwner,
    }}>
      {childrenProp}
    </ChildContext.Provider>
  );
};
