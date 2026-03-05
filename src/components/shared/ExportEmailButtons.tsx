import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExportAndEmail } from "@/hooks/useExportAndEmail";

interface ExportEmailButtonsProps {
  exportFunctionName: string;
  emailFunctionName: string;
  exportFilename: string;
  label: string;
}

const ExportEmailButtons = ({
  exportFunctionName,
  emailFunctionName,
  exportFilename,
  label,
}: ExportEmailButtonsProps) => {
  const { t } = useTranslation();
  const { exportAsHtml, sendByEmail, isExporting, isSending } = useExportAndEmail();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");

  const handleSendEmail = async () => {
    if (!recipientEmail) return;
    await sendByEmail(emailFunctionName, recipientEmail, recipientName);
    setEmailDialogOpen(false);
    setRecipientEmail("");
    setRecipientName("");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportAsHtml(exportFunctionName, exportFilename)}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t('common.export')}
      </Button>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {t('common.email')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('export.emailDialog.title', { label })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">{t('export.emailDialog.recipientEmail')}</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder={t('export.emailDialog.recipientEmailPlaceholder')}
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">{t('export.emailDialog.recipientName')}</Label>
              <Input
                id="recipientName"
                placeholder={t('export.emailDialog.recipientNamePlaceholder')}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button
              onClick={handleSendEmail}
              disabled={!recipientEmail || isSending}
              className="bg-special-600 hover:bg-special-700 text-white flex items-center gap-2"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t('common.send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportEmailButtons;
