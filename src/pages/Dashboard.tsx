
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/Dashboard";
import KeyInformation from "@/components/sections/KeyInformation";
import EmergencyCards from "@/components/sections/EmergencyCards";
import MedicationsList from "@/components/sections/MedicationsList";
import MedicalContacts from "@/components/sections/MedicalContacts";
import SuppliersList from "@/components/sections/SuppliersList";
import HomeSafety from "@/components/sections/HomeSafety";
import CommunityServices from "@/components/sections/CommunityServices";
import DailyLog from "@/components/sections/DailyLog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, AlertTriangle, Heart, Pill, Phone, Truck, Shield, Building } from "lucide-react";

const Dashboard = () => {
  const { section } = useParams();
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  useEffect(() => {
    if (section) {
      setActiveSection(section);
    } else {
      setActiveSection("dashboard");
    }
  }, [section]);

  const renderContent = () => {
    switch (activeSection) {
      case "key-information":
        return <KeyInformation />;
      case "emergency-cards":
        return <EmergencyCards />;
      case "medications":
        return <MedicationsList />;
      case "suppliers":
        return <SuppliersList />;
      case "medical-contacts":
        return <MedicalContacts />;
      case "home-safety":
        return <HomeSafety />;
      case "community-services":
        return <CommunityServices />;
      case "daily-log":
        return <DailyLog />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-8 px-4 md:px-6 animate-fadeIn">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

const DashboardOverview = () => {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your caregiver organizer dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Link to="/dashboard/key-information" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <User className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Key Information</CardTitle>
              <CardDescription>
                Personal and identification details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Store essential personal information, contact details, and important identification numbers.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/emergency-cards" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <AlertTriangle className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Emergency Cards</CardTitle>
              <CardDescription>
                Digital copies of ID cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Upload and store digital versions of important identification and insurance cards.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/medical-information" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <Heart className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Medical Information</CardTitle>
              <CardDescription>
                Health history and conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Document medical history, current conditions, allergies, and other important health information.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/medications" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <Pill className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Medications</CardTitle>
              <CardDescription>
                Medication tracking and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Manage all medications, including dosages, schedules, and special instructions.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/home-safety" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <Shield className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Home Safety</CardTitle>
              <CardDescription>
                Safety protocols and emergency procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Comprehensive safety planning, emergency preparedness, and home safety checklists.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/suppliers" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <Truck className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Suppliers & Providers</CardTitle>
              <CardDescription>
                Where to buy medicines and supplies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Track all suppliers and providers for medicines, supplements, and caregiving supplies.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/medical-contacts" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <Phone className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Medical Contacts</CardTitle>
              <CardDescription>
                Healthcare providers contact list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Keep track of all healthcare providers, their contact information, and specialties.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/community-services" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <Building className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Community Services</CardTitle>
              <CardDescription>
                Local resources and support services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Discover local resources, programs, and support services for special needs families.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/daily-log" className="block transition-transform hover:scale-105">
          <Card className="bg-white shadow-sm border border-border h-full">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-special-50 flex items-center justify-center mb-1">
                <Calendar className="h-6 w-6 text-special-600" />
              </div>
              <CardTitle className="text-lg">Daily Log</CardTitle>
              <CardDescription>
                Record of daily care activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                Track daily care activities, observations, and important events for better care coordination.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="text-center p-6 bg-special-50 rounded-xl">
        <h3 className="text-xl font-medium mb-2">Getting Started</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Begin by adding your key information and emergency contacts. You can add more sections as needed.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
