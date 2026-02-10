
import { useState, useEffect } from "react";
import { useChild } from "@/contexts/ChildContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Copy, Trash2, Mail, Key, Loader2 } from "lucide-react";

interface CareTeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
  email?: string;
}

interface Invite {
  id: string;
  invite_code: string;
  invited_email: string | null;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const CareTeamManager = () => {
  const { activeChild, isOwner } = useChild();
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<CareTeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("caregiver");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const isCurrentOwner = isOwner(activeChild?.id);

  const fetchTeam = async () => {
    if (!activeChild) return;
    setIsLoading(true);
    try {
      // Fetch access entries for this child
      const { data: accessData, error: accessError } = await supabase
        .from('child_access')
        .select('id, user_id, role, created_at')
        .eq('child_id', activeChild.id);

      if (accessError) throw accessError;

      // Fetch profiles for all team members
      const userIds = (accessData || []).map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const teamMembers: CareTeamMember[] = (accessData || []).map(a => ({
        ...a,
        profile: profileMap.get(a.user_id) || undefined,
      }));

      setMembers(teamMembers);

      // Fetch pending invites if owner
      if (isCurrentOwner) {
        const { data: inviteData } = await supabase
          .from('child_invites')
          .select('*')
          .eq('child_id', activeChild.id)
          .eq('status', 'pending');

        setInvites((inviteData || []) as Invite[]);
      }
    } catch (error: any) {
      console.error("Error fetching care team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [activeChild?.id]);

  const handleInvite = async () => {
    if (!activeChild || !user) return;
    try {
      const insertData: any = {
        child_id: activeChild.id,
        invited_by: user.id,
        role: inviteRole,
      };
      if (inviteEmail.trim()) {
        insertData.invited_email = inviteEmail.trim().toLowerCase();
      }

      const { data, error } = await supabase
        .from('child_invites')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      setGeneratedCode((data as Invite).invite_code);
      setInviteEmail("");
      fetchTeam();
      toast({ title: "Invite created", description: "Share the invite code with the caregiver." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!removeId) return;
    try {
      const { error } = await supabase
        .from('child_access')
        .delete()
        .eq('id', removeId);

      if (error) throw error;
      setRemoveId(null);
      fetchTeam();
      toast({ title: "Member removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('child_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
      fetchTeam();
      toast({ title: "Invite revoked" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Invite code copied to clipboard." });
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-special-100 text-special-800';
      case 'caregiver': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return '';
    }
  };

  if (!activeChild) return null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Care Team
          </CardTitle>
          {isCurrentOwner && (
            <Button size="sm" variant="outline" onClick={() => { setIsInviteOpen(true); setGeneratedCode(null); }} className="gap-1">
              <UserPlus className="h-4 w-4" /> Invite
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {m.profile?.full_name || "Unknown user"}
                      {m.user_id === user?.id && " (You)"}
                    </span>
                    <Badge variant="secondary" className={`text-xs ${roleColor(m.role)}`}>
                      {m.role}
                    </Badge>
                  </div>
                  {isCurrentOwner && m.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive shrink-0"
                      onClick={() => setRemoveId(m.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}

              {invites.length > 0 && isCurrentOwner && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Pending Invites</p>
                  {invites.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between gap-2 py-1">
                      <div className="flex items-center gap-2 min-w-0 text-sm">
                        {inv.invited_email ? (
                          <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" /> {inv.invited_email}</span>
                        ) : (
                          <span className="flex items-center gap-1"><Key className="h-3 w-3" /> Code only</span>
                        )}
                        <Badge variant="outline" className="text-xs">{inv.role}</Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(inv.invite_code)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteInvite(inv.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Caregiver</DialogTitle>
            <DialogDescription>
              Create an invite code to share with another caregiver. Optionally add their email to help them find the invite.
            </DialogDescription>
          </DialogHeader>

          {generatedCode ? (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Share this invite code</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{generatedCode}</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => copyCode(generatedCode)}>
                <Copy className="h-4 w-4 mr-2" /> Copy Code
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This code expires in 7 days. The recipient can redeem it from their dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email (optional)</label>
                <Input
                  placeholder="caregiver@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caregiver">Caregiver (read & write)</SelectItem>
                    <SelectItem value="viewer">Viewer (read only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              {generatedCode ? "Done" : "Cancel"}
            </Button>
            {!generatedCode && (
              <Button onClick={handleInvite}>Create Invite</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove member confirmation */}
      <AlertDialog open={!!removeId} onOpenChange={(open) => !open && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              This person will lose access to this child's data. They can be re-invited later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CareTeamManager;
