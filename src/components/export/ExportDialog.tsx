import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { downloadExport, ExportFormat, ExportSection } from '@/lib/exporters';

interface ExportDialogProps {
  childId: string;
  childName?: string;
  trigger?: React.ReactNode;
}

const SECTIONS: { id: ExportSection; labelKey: string; descKey: string }[] = [
  { id: 'keyInformation', labelKey: 'export.sections.keyInformation.label', descKey: 'export.sections.keyInformation.description' },
  { id: 'medications', labelKey: 'export.sections.medications.label', descKey: 'export.sections.medications.description' },
  { id: 'medicalContacts', labelKey: 'export.sections.medicalContacts.label', descKey: 'export.sections.medicalContacts.description' },
  { id: 'emergencyProtocols', labelKey: 'export.sections.emergencyProtocols.label', descKey: 'export.sections.emergencyProtocols.description' },
  { id: 'emergencyCards', labelKey: 'export.sections.emergencyCards.label', descKey: 'export.sections.emergencyCards.description' },
  { id: 'dailyLogs', labelKey: 'export.sections.dailyLogs.label', descKey: 'export.sections.dailyLogs.description' },
  { id: 'suppliers', labelKey: 'export.sections.suppliers.label', descKey: 'export.sections.suppliers.description' },
  { id: 'employmentAgreements', labelKey: 'export.sections.employmentAgreements.label', descKey: 'export.sections.employmentAgreements.description' },
  { id: 'financialLegal', labelKey: 'export.sections.financialLegal.label', descKey: 'export.sections.financialLegal.description' },
  { id: 'endOfLifeWishes', labelKey: 'export.sections.endOfLifeWishes.label', descKey: 'export.sections.endOfLifeWishes.description' },
  { id: 'homeSafety', labelKey: 'export.sections.homeSafety.label', descKey: 'export.sections.homeSafety.description' },
  { id: 'celebrations', labelKey: 'export.sections.celebrations.label', descKey: 'export.sections.celebrations.description' },
  { id: 'documents', labelKey: 'export.sections.documents.label', descKey: 'export.sections.documents.description' },
];

const FORMATS: { id: ExportFormat; labelKey: string; icon: React.ReactNode; descKey: string }[] = [
  {
    id: 'pdf',
    labelKey: 'export.formats.pdf.label',
    icon: <FileText className="h-5 w-5" />,
    descKey: 'export.formats.pdf.description',
  },
  {
    id: 'csv',
    labelKey: 'export.formats.csv.label',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    descKey: 'export.formats.csv.description',
  },
  {
    id: 'json',
    labelKey: 'export.formats.json.label',
    icon: <FileJson className="h-5 w-5" />,
    descKey: 'export.formats.json.description',
  },
];

export function ExportDialog({ childId, childName, trigger }: ExportDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [selectedSections, setSelectedSections] = useState<ExportSection[]>(['all']);
  const [isExporting, setIsExporting] = useState(false);

  const isAllSelected = selectedSections.includes('all');

  const handleSectionToggle = (sectionId: ExportSection, checked: boolean) => {
    if (sectionId === 'all') {
      setSelectedSections(checked ? ['all'] : []);
    } else {
      // Remove 'all' when toggling individual sections
      const newSections = selectedSections.filter((s) => s !== 'all');

      if (checked) {
        setSelectedSections([...newSections, sectionId]);
      } else {
        setSelectedSections(newSections.filter((s) => s !== sectionId));
      }
    }
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: t('toast.selectSections'),
        description: t('toast.selectSectionsDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      await downloadExport({
        childId,
        format,
        sections: selectedSections,
      });

      toast({
        title: t('toast.exportComplete'),
        description: t('toast.exportCompleteDesc'),
      });

      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('toast.exportFailed'),
        description: error instanceof Error ? error.message : t('toast.exportFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('common.export')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>
            {childName
              ? t('export.descriptionWithName', { childName })
              : t('export.descriptionGeneric')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('export.format')}</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="grid grid-cols-3 gap-3"
            >
              {FORMATS.map((f) => (
                <div key={f.id}>
                  <RadioGroupItem
                    value={f.id}
                    id={`format-${f.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`format-${f.id}`}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    {f.icon}
                    <span className="mt-2 text-xs font-medium">{t(f.labelKey)}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {t(FORMATS.find((f) => f.id === format)?.descKey || '')}
            </p>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('export.sectionsToInclude')}</Label>
            <div className="space-y-2">
              {/* All sections option */}
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <Checkbox
                  id="section-all"
                  checked={isAllSelected}
                  onCheckedChange={(checked) =>
                    handleSectionToggle('all', checked as boolean)
                  }
                />
                <div className="grid gap-0.5 leading-none">
                  <Label htmlFor="section-all" className="font-medium cursor-pointer">
                    {t('export.allSections')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('export.exportEverything')}
                  </p>
                </div>
              </div>

              {/* Individual sections */}
              <div className="grid gap-2 pl-6">
                {SECTIONS.map((section) => (
                  <div key={section.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={isAllSelected || selectedSections.includes(section.id)}
                      disabled={isAllSelected}
                      onCheckedChange={(checked) =>
                        handleSectionToggle(section.id, checked as boolean)
                      }
                    />
                    <div className="grid gap-0.5 leading-none">
                      <Label
                        htmlFor={`section-${section.id}`}
                        className={`text-sm cursor-pointer ${
                          isAllSelected ? 'text-muted-foreground' : ''
                        }`}
                      >
                        {t(section.labelKey)}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t(section.descKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedSections.length === 0}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.exporting')}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('common.export')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
