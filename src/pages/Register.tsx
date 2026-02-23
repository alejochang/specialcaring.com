
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Register = () => {
  const [consentGiven, setConsentGiven] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gradient-to-br from-background to-caregiver-50">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
          <div className="hidden md:block">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Create Your Caregiver Account</h1>
              <p className="text-muted-foreground">
                Join thousands of caregivers who use our platform to organize and manage their caregiving responsibilities.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Create an account</h3>
                    <p className="text-sm text-muted-foreground">
                      Register with your email and set a secure password.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Set up your profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Add essential information about the person receiving care.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Start organizing</h3>
                    <p className="text-sm text-muted-foreground">
                      Begin adding medical information, contacts, and other important details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <AuthForm type="register" disabled={!consentGiven} />
            
            <div className="flex items-start space-x-3 rounded-md border border-border p-4 bg-muted/30">
              <Checkbox
                id="privacy-consent"
                checked={consentGiven}
                onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
              />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="privacy-consent" className="text-sm cursor-pointer">
                  I acknowledge and agree to the{" "}
                  <Link to="/privacy" className="text-special-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  , including how my data and my child&rsquo;s data will be collected, stored, and protected.
                </Label>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
