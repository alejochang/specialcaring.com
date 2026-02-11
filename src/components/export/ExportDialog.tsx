import { useState } from 'react';
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

const SECTIONS: { id: ExportSection; label: string; description: string }[] = [
  {
    id: 'keyInformation',
    label: 'Key Information',
    description: 'Basic profile, contact info, medical conditions',
  },
  {
    id: 'medications',
    label: 'Medications',
    description: 'Current medications, dosages, schedules',
  },
  {
    id: 'medicalContacts',
    label: 'Medical Contacts',
    description: 'Doctors, specialists, healthcare providers',
  },
  {
    id: 'emergencyProtocols',
    label: 'Emergency Protocols',
    description: 'Emergency procedures and instructions',
  },
  {
    id: 'dailyLogs',
    label: 'Daily Logs',
    description: 'Recent daily care logs and notes',
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    description: 'Medical equipment and supply providers',
  },
];

const FORMATS: { id: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'pdf',
    label: 'PDF Document',
    icon: <FileText className="h-5 w-5" />,
    description: 'Best for printing and sharing',
  },
  {
    id: 'csv',
    label: 'CSV Spreadsheet',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    description: 'For Excel, Google Sheets',
  },
  {
    id: 'json',
    label: 'JSON Data',
    icon: <FileJson className="h-5 w-5" />,
    description: 'Machine-readable backup',
  },
];

export function ExportDialog({ childId, childName, trigger }: ExportDialogProps) {
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
        title: 'Select sections',
        description: 'Please select at least one section to export',
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
        title: 'Export complete',
        description: 'Your data has been exported successfully',
      });

      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
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
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            {childName
              ? `Export care data for ${childName}`
              : 'Export care data in your preferred format'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
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
                    <span className="mt-2 text-xs font-medium">{f.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              {FORMATS.find((f) => f.id === format)?.description}
            </p>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sections to Include</Label>
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
                    All Sections
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Export everything
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
                        {section.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {section.description}
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
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedSections.length === 0}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
