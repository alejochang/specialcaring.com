
import { Link } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-gradient-to-br from-background to-caregiver-50">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
          <div className="hidden md:block">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Welcome back to Caregiver Organizer</h1>
              <p className="text-muted-foreground">
                Sign in to access your caregiving information dashboard and continue managing your care details.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Centralized Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Access all your caregiving information from anywhere, anytime.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      Your information is stored securely and only accessible to authorized users.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-caregiver-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-caregiver-600 font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Easy Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Update information quickly as care needs change over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <AuthForm type="login" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
