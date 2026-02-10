
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Ticket } from "lucide-react";

interface RedeemInviteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RedeemInvite = ({ open, onOpenChange }: RedeemInviteProps) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { refetch } = useChild();
  const { toast } = useToast();

  const handleRedeem = async () => {
    if (!user || !code.trim()) return;
    setIsSubmitting(true);

    try {
      const { data: result, error } = await supabase.rpc('redeem_invite', {
        _invite_code: code.trim().toLowerCase(),
        _user_id: user.id,
      });

      if (error) throw error;

      const parsed = result as { success: boolean; error?: string; child_id?: string };
      if (!parsed.success) {
        toast({ title: "Error", description: parsed.error || "Could not redeem invite.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      await refetch();
      setCode("");
      onOpenChange(false);
      toast({ title: "Success!", description: "You now have access to this child's care information." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> Redeem Invite Code
          </DialogTitle>
          <DialogDescription>
            Enter the invite code shared by another caregiver to access their child's care information.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Enter invite code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          className="font-mono text-center text-lg tracking-wider"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleRedeem} disabled={!code.trim() || isSubmitting}>
            {isSubmitting ? "Redeeming..." : "Redeem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemInvite;
