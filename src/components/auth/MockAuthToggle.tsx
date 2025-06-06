
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, Copy, Check } from "lucide-react";
import { MOCK_CREDENTIALS } from "@/hooks/useMockAuth";
import { useToast } from "@/hooks/use-toast";

interface MockAuthToggleProps {
  onUseMockAuth: () => void;
  onUseRealAuth: () => void;
  isMockMode: boolean;
}

const MockAuthToggle = ({ onUseMockAuth, onUseRealAuth, isMockMode }: MockAuthToggleProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6 border-dashed border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg text-orange-800">Test Mode</CardTitle>
          {isMockMode && <Badge variant="secondary" className="bg-orange-100 text-orange-800">Active</Badge>}
        </div>
        <CardDescription className="text-orange-700">
          Use mock authentication to test the application without Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isMockMode ? (
          <Button 
            onClick={onUseMockAuth} 
            variant="outline" 
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <TestTube className="mr-2 h-4 w-4" />
            Enable Test Mode
          </Button>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-800">Test Email:</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1 bg-white rounded border text-sm">
                    {MOCK_CREDENTIALS.email}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(MOCK_CREDENTIALS.email, "Email")}
                    className="px-2"
                  >
                    {copiedField === "Email" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-800">Test Password:</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1 bg-white rounded border text-sm">
                    {MOCK_CREDENTIALS.password}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(MOCK_CREDENTIALS.password, "Password")}
                    className="px-2"
                  >
                    {copiedField === "Password" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <Button 
              onClick={onUseRealAuth} 
              variant="outline" 
              size="sm"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Switch to Real Authentication
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MockAuthToggle;
