
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
import MedicalEmergencyProtocols from "@/components/sections/MedicalEmergencyProtocols";
import EmploymentAgreement from "@/components/sections/EmploymentAgreement";
import FinancialLegal from "@/components/sections/FinancialLegal";
import EndOfLifeWishes from "@/components/sections/EndOfLifeWishes";
import DocumentsSection from "@/components/sections/DocumentsSection";
import Celebrations from "@/components/sections/Celebrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, AlertTriangle, FileText, Pill, Phone, Truck, Shield, Building, Calendar, PartyPopper, Briefcase, Scale, BookHeart, FolderOpen } from "lucide-react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import TodaySnapshot from "@/components/dashboard/TodaySnapshot";
import QuickActions from "@/components/dashboard/QuickActions";

import CareTeamManager from "@/components/CareTeamManager";
import { useChild } from "@/contexts/ChildContext";

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
      case "medical-emergency-protocols":
        return <MedicalEmergencyProtocols />;
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
      case "employment":
        return <EmploymentAgreement />;
      case "financial-legal":
        return <FinancialLegal />;
      case "end-of-life":
        return <EndOfLifeWishes />;
      case "documents":
        return <DocumentsSection />;
      case "celebrations":
        return <Celebrations />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-8 px-4 md:px-6 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
          <div className="lg:col-span-1">
            <CareTeamManager />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const sectionGroups = [
  {
    title: "Medical & Emergency",
    items: [
      { to: "/dashboard/key-information", icon: Heart, label: "Child Profile", desc: "Essential info & preferences", color: "text-special-600" },
      { to: "/dashboard/emergency-cards", icon: AlertTriangle, label: "Emergency Cards", desc: "Digital ID & insurance cards", color: "text-special-600" },
      { to: "/dashboard/medical-emergency-protocols", icon: FileText, label: "Emergency Protocols", desc: "Medical emergency guides", color: "text-destructive" },
      { to: "/dashboard/medications", icon: Pill, label: "Medications", desc: "Dosages & schedules", color: "text-special-600" },
      { to: "/dashboard/medical-contacts", icon: Phone, label: "Medical Contacts", desc: "Healthcare providers", color: "text-special-600" },
      { to: "/dashboard/suppliers", icon: Truck, label: "Suppliers & Providers", desc: "Medicines & supplies", color: "text-special-600" },
    ],
  },
  {
    title: "Daily Life & Safety",
    items: [
      { to: "/dashboard/daily-log", icon: Calendar, label: "Daily Log", desc: "Activities & observations", color: "text-special-600" },
      { to: "/dashboard/home-safety", icon: Shield, label: "Home Safety", desc: "Safety protocols & checklists", color: "text-special-600" },
      { to: "/dashboard/celebrations", icon: PartyPopper, label: "Celebrations", desc: "Achievements & milestones", color: "text-special-600" },
    ],
  },
  {
    title: "Resources & Admin",
    items: [
      { to: "/dashboard/community-services", icon: Building, label: "Community Services", desc: "Local resources & support", color: "text-special-600" },
      { to: "/dashboard/employment", icon: Briefcase, label: "Employment", desc: "Care team agreements", color: "text-special-600" },
      { to: "/dashboard/financial-legal", icon: Scale, label: "Financial & Legal", desc: "Important documents", color: "text-special-600" },
      { to: "/dashboard/end-of-life", icon: BookHeart, label: "End-of-Life Wishes", desc: "Advanced directives", color: "text-special-600" },
      { to: "/dashboard/documents", icon: FolderOpen, label: "Documents", desc: "Uploaded files & records", color: "text-special-600" },
    ],
  },
];

const DashboardOverview = () => {
  return (
    <div className="animate-fadeIn">
      <DashboardHero />
      <TodaySnapshot />
      <QuickActions />

      {sectionGroups.map((group) => (
        <div key={group.title} className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {group.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.items.map((item) => (
              <Link key={item.to} to={item.to} className="group">
                <Card className="border border-border bg-card hover:shadow-md hover:border-special-200 transition-all">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="w-9 h-9 rounded-lg bg-special-50 dark:bg-special-950/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
