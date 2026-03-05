
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        toast({ title: t('common.error'), description: parsed.error || t('toast.inviteRedeemFailed'), variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      await refetch();
      setCode("");
      onOpenChange(false);
      toast({ title: t('toast.inviteRedeemed'), description: t('toast.inviteRedeemedDesc') });
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" /> {t('redeemInvite.title')}
          </DialogTitle>
          <DialogDescription>
            {t('redeemInvite.description')}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder={t('redeemInvite.placeholder')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          className="font-mono text-center text-lg tracking-wider"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('redeemInvite.cancel')}</Button>
          <Button onClick={handleRedeem} disabled={!code.trim() || isSubmitting}>
            {isSubmitting ? t('redeemInvite.redeeming') : t('redeemInvite.redeem')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemInvite;
