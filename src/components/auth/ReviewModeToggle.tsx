import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Play, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ReviewModeToggleProps {
  onStartReview: () => void;
  onExitReview: () => void;
  isReviewMode: boolean;
}

/**
 * Review Mode Toggle Component
 *
 * SECURITY: This component is only rendered in development builds.
 * The __REVIEW_MODE_ENABLED__ flag is checked before rendering.
 */
const ReviewModeToggle = ({ onStartReview, onExitReview, isReviewMode }: ReviewModeToggleProps) => {
  const { t } = useTranslation();

  // Only render in development mode
  if (!__REVIEW_MODE_ENABLED__) {
    return null;
  }

  return (
    <Card className="mb-6 border-dashed border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-800">{t('auth.reviewMode.title')}</CardTitle>
          {isReviewMode && <Badge variant="secondary" className="bg-blue-100 text-blue-800">{t('auth.reviewMode.active')}</Badge>}
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
            {t('auth.reviewMode.devOnly')}
          </Badge>
        </div>
        <CardDescription className="text-blue-700">
          {t('auth.reviewMode.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isReviewMode ? (
          <div className="space-y-3">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">{t('auth.reviewMode.whatYouSee')}</p>
              <ul className="space-y-1 text-sm">
                <li>{t('auth.reviewMode.bullet1')}</li>
                <li>{t('auth.reviewMode.bullet2')}</li>
                <li>{t('auth.reviewMode.bullet3')}</li>
                <li>{t('auth.reviewMode.bullet4')}</li>
              </ul>
            </div>
            <Button
              onClick={onStartReview}
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Play className="mr-2 h-4 w-4" />
              {t('auth.reviewMode.startButton')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                {t('auth.reviewMode.activeMessage')}
              </p>
            </div>
            <Button
              onClick={onExitReview}
              variant="outline"
              size="sm"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <X className="mr-2 h-4 w-4" />
              {t('auth.reviewMode.exitButton')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewModeToggle;
