import { Link } from "react-router-dom";
import { Plus, Pill, AlertTriangle, Download } from "lucide-react";
import { useChild } from "@/contexts/ChildContext";
import { ExportDialog } from "@/components/export/ExportDialog";

const QuickActions = () => {
  const { activeChild } = useChild();

  if (!activeChild) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-8">
      <Link
        to="/dashboard/daily-log"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors shadow-sm"
      >
        <Plus className="h-3.5 w-3.5" />
        Daily Log
      </Link>
      <Link
        to="/dashboard/medications"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors shadow-sm"
      >
        <Pill className="h-3.5 w-3.5" />
        Medication
      </Link>
      <Link
        to="/dashboard/emergency-cards"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors shadow-sm"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Emergency Card
      </Link>
      <ExportDialog
        childId={activeChild.id}
        childName={activeChild.name}
        trigger={
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors shadow-sm">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        }
      />
    </div>
  );
};

export default QuickActions;
