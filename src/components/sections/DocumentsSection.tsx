import { useChild } from "@/contexts/ChildContext";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DocumentsSection = () => {
  const { activeChild } = useChild();

  if (!activeChild) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Documents</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select or create a child profile to manage documents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Documents</h1>
      <DocumentUpload
        childId={activeChild.id}
        title="Important Documents"
        description="Upload and manage medical records, insurance cards, care instructions, and other important documents."
      />
    </div>
  );
};

export default DocumentsSection;
