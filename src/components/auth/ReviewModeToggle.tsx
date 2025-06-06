
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Play, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewModeToggleProps {
  onStartReview: () => void;
  onExitReview: () => void;
  isReviewMode: boolean;
}

const ReviewModeToggle = ({ onStartReview, onExitReview, isReviewMode }: ReviewModeToggleProps) => {
  const { toast } = useToast();

  return (
    <Card className="mb-6 border-dashed border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-800">Review Mode</CardTitle>
          {isReviewMode && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Active</Badge>}
        </div>
        <CardDescription className="text-blue-700">
          Explore the application with sample data without creating an account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isReviewMode ? (
          <div className="space-y-3">
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">What you'll see in Review Mode:</p>
              <ul className="space-y-1 text-sm">
                <li>• Sample medical information and medications</li>
                <li>• Pre-filled emergency protocols and contacts</li>
                <li>• Demo daily logs and care activities</li>
                <li>• All features with realistic example data</li>
              </ul>
            </div>
            <Button 
              onClick={onStartReview} 
              variant="outline" 
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Review Mode
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                You're currently exploring with sample data. Changes won't be saved.
              </p>
            </div>
            <Button 
              onClick={onExitReview} 
              variant="outline" 
              size="sm"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <X className="mr-2 h-4 w-4" />
              Exit Review Mode
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewModeToggle;
