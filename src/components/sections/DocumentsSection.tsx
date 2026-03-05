import { useTranslation } from "react-i18next";
import { useChild } from "@/contexts/ChildContext";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DocumentsSection = () => {
  const { t } = useTranslation();
  const { activeChild } = useChild();

  if (!activeChild) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-6">{t('sections.documents.title')}</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('sections.documents.noChildProfile')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">{t('sections.documents.title')}</h1>
      <DocumentUpload
        childId={activeChild.id}
        title={t('sections.documents.importantDocuments')}
        description={t('sections.documents.importantDocumentsDesc')}
      />
    </div>
  );
};

export default DocumentsSection;
