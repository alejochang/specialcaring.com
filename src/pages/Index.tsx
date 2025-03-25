
import { Link } from "react-router-dom";
import { ChevronRight, Shield, Heart, FileText, Calendar, Clock, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-caregiver-50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-foreground max-w-lg">
                  Simplify Caregiving With Better Organization
                </h1>
                <p className="mt-6 text-lg text-muted-foreground max-w-md">
                  A central hub to manage all the essential information for caring for your aging parents, accessible when you need it most.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-caregiver-600 hover:bg-caregiver-700 shadow-lg">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Check size={16} className="text-caregiver-600" />
                <span>Secure and private</span>
                <span className="mx-2">•</span>
                <Check size={16} className="text-caregiver-600" />
                <span>Easy to update</span>
                <span className="mx-2">•</span>
                <Check size={16} className="text-caregiver-600" />
                <span>Always accessible</span>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -left-6 -top-6 w-72 h-72 bg-caregiver-100 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -right-6 -bottom-6 w-72 h-72 bg-caregiver-200 rounded-full filter blur-3xl opacity-70 animate-pulse delay-700"></div>
                <div className="relative glass-card rounded-2xl overflow-hidden shadow-xl z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1576765608622-067973a79f53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                    alt="Caregiver and elder"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Everything You Need In One Place
            </h2>
            <p className="text-lg text-muted-foreground">
              Caregiver Organizer provides all the tools you need to manage caregiving information efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border hover-card">
              <div className="mb-4 bg-caregiver-50 w-12 h-12 rounded-full flex items-center justify-center">
                <FileText className="text-caregiver-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Essential Information</h3>
              <p className="text-muted-foreground mb-4">
                Store personal details, emergency contacts, and identification information securely.
              </p>
              <Link to="/register" className="text-caregiver-600 hover:text-caregiver-700 inline-flex items-center">
                Learn more
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border hover-card">
              <div className="mb-4 bg-caregiver-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Heart className="text-caregiver-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Medical Management</h3>
              <p className="text-muted-foreground mb-4">
                Track medications, medical contacts, and healthcare appointments in one location.
              </p>
              <Link to="/register" className="text-caregiver-600 hover:text-caregiver-700 inline-flex items-center">
                Learn more
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border hover-card">
              <div className="mb-4 bg-caregiver-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Shield className="text-caregiver-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Home Safety</h3>
              <p className="text-muted-foreground mb-4">
                Maintain checklists for home safety measures and emergency protocols.
              </p>
              <Link to="/register" className="text-caregiver-600 hover:text-caregiver-700 inline-flex items-center">
                Learn more
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border hover-card">
              <div className="mb-4 bg-caregiver-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Calendar className="text-caregiver-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Daily Logs</h3>
              <p className="text-muted-foreground mb-4">
                Record daily activities, observations, and important events for continuity of care.
              </p>
              <Link to="/register" className="text-caregiver-600 hover:text-caregiver-700 inline-flex items-center">
                Learn more
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border hover-card">
              <div className="mb-4 bg-caregiver-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="text-caregiver-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Caregiver Contacts</h3>
              <p className="text-muted-foreground mb-4">
                Manage information for all caregivers and family members involved in care.
              </p>
              <Link to="/register" className="text-caregiver-600 hover:text-caregiver-700 inline-flex items-center">
                Learn more
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border hover-card">
              <div className="mb-4 bg-caregiver-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Clock className="text-caregiver-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Long-Term Planning</h3>
              <p className="text-muted-foreground mb-4">
                Document financial, legal, and end-of-life wishes for comprehensive planning.
              </p>
              <Link to="/register" className="text-caregiver-600 hover:text-caregiver-700 inline-flex items-center">
                Learn more
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-caregiver-600">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white space-y-4">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Ready to simplify your caregiving journey?
              </h2>
              <p className="text-caregiver-100 text-lg">
                Join thousands of caregivers who have found relief through better organization.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-caregiver-100" />
                  <span>Save time with easy information access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-caregiver-100" />
                  <span>Reduce stress with better organization</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-caregiver-100" />
                  <span>Improve care coordination with family members</span>
                </li>
              </ul>
              <div className="pt-4">
                <Link to="/register">
                  <Button className="bg-white text-caregiver-600 hover:bg-caregiver-50">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative bg-caregiver-700 rounded-2xl p-8 text-white hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-caregiver-700 to-caregiver-800 rounded-2xl"></div>
              <div className="relative z-10">
                <blockquote className="text-lg italic mb-8">
                  "The Caregiver Organizer has been a lifesaver. Having all the information in one place has made coordinating care with my siblings so much easier."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-caregiver-600 rounded-full"></div>
                  <div>
                    <p className="font-medium">Sarah Thompson</p>
                    <p className="text-sm text-caregiver-200">Family Caregiver</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
