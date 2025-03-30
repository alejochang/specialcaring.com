
import { Link } from "react-router-dom";
import { ChevronRight, Heart, FileText, Calendar, Clock, Users, Check, Smile, Star, Sun, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-background to-special-50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-foreground max-w-lg">
                  {t('home.hero.title')}
                </h1>
                <p className="mt-6 text-lg text-foreground max-w-md font-medium">
                  {t('home.hero.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-special-600 hover:bg-special-700 shadow-lg rounded-full">
                    {t('home.hero.getStarted')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="rounded-full">
                    {t('home.hero.signIn')}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm flex-wrap font-medium">
                <Check size={16} className="text-special-600" />
                <span>{t('home.hero.features.safe')}</span>
                <span className="mx-2">•</span>
                <Check size={16} className="text-special-600" />
                <span>{t('home.hero.features.easyUpdate')}</span>
                <span className="mx-2">•</span>
                <Check size={16} className="text-special-600" />
                <span>{t('home.hero.features.alwaysAccessible')}</span>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -left-6 -top-6 w-72 h-72 bg-kids-100 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -right-6 -bottom-6 w-72 h-72 bg-special-200 rounded-full filter blur-3xl opacity-70 animate-pulse delay-700"></div>
                <div className="relative glass-card rounded-3xl overflow-hidden shadow-xl z-10 border-2 border-special-200">
                  <img 
                    src="/lovable-uploads/468cc94a-55d5-408f-91e5-0ee1d595a572.png" 
                    alt="Mother hugging child in wheelchair with care information tablet"
                    className="w-full h-full object-contain p-4"
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
              {t('home.featuresSection.title')}
            </h2>
            <p className="text-lg text-foreground font-medium">
              {t('home.featuresSection.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="kid-card">
              <div className="mb-4 bg-special-50 w-12 h-12 rounded-full flex items-center justify-center">
                <FileText className="text-special-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.featuresSection.features.essentialInfo.title')}</h3>
              <p className="text-foreground mb-4 font-medium">
                {t('home.featuresSection.features.essentialInfo.description')}
              </p>
              <Link to="/register" className="text-special-600 hover:text-special-700 inline-flex items-center font-medium">
                {t('home.featuresSection.learnMore')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="kid-card">
              <div className="mb-4 bg-special-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Heart className="text-special-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.featuresSection.features.medicalManagement.title')}</h3>
              <p className="text-foreground mb-4 font-medium">
                {t('home.featuresSection.features.medicalManagement.description')}
              </p>
              <Link to="/register" className="text-special-600 hover:text-special-700 inline-flex items-center font-medium">
                {t('home.featuresSection.learnMore')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="kid-card">
              <div className="mb-4 bg-special-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Baby className="text-special-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.featuresSection.features.specialNeeds.title')}</h3>
              <p className="text-foreground mb-4 font-medium">
                {t('home.featuresSection.features.specialNeeds.description')}
              </p>
              <Link to="/register" className="text-special-600 hover:text-special-700 inline-flex items-center font-medium">
                {t('home.featuresSection.learnMore')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="kid-card">
              <div className="mb-4 bg-special-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Calendar className="text-special-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.featuresSection.features.dailyLogs.title')}</h3>
              <p className="text-foreground mb-4 font-medium">
                {t('home.featuresSection.features.dailyLogs.description')}
              </p>
              <Link to="/register" className="text-special-600 hover:text-special-700 inline-flex items-center font-medium">
                {t('home.featuresSection.learnMore')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="kid-card">
              <div className="mb-4 bg-special-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="text-special-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.featuresSection.features.careTeam.title')}</h3>
              <p className="text-foreground mb-4 font-medium">
                {t('home.featuresSection.features.careTeam.description')}
              </p>
              <Link to="/register" className="text-special-600 hover:text-special-700 inline-flex items-center font-medium">
                {t('home.featuresSection.learnMore')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="kid-card">
              <div className="mb-4 bg-special-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Star className="text-special-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.featuresSection.features.growthMilestones.title')}</h3>
              <p className="text-foreground mb-4 font-medium">
                {t('home.featuresSection.features.growthMilestones.description')}
              </p>
              <Link to="/register" className="text-special-600 hover:text-special-700 inline-flex items-center font-medium">
                {t('home.featuresSection.learnMore')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-special-600 to-kids-500">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white space-y-4">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t('home.ctaSection.title')}
              </h2>
              <p className="text-white text-lg font-medium">
                {t('home.ctaSection.subtitle')}
              </p>
              <ul className="space-y-2 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-special-100" />
                  <span>{t('home.ctaSection.benefits.saveTime')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-special-100" />
                  <span>{t('home.ctaSection.benefits.reduceStress')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-special-100" />
                  <span>{t('home.ctaSection.benefits.improveCare')}</span>
                </li>
              </ul>
              <div className="pt-4">
                <Link to="/register">
                  <Button className="bg-white text-special-600 hover:bg-special-50 rounded-full font-semibold">
                    {t('home.ctaSection.getStartedFree')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative bg-special-700 rounded-3xl p-8 text-white hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-special-700 to-special-800 rounded-3xl"></div>
              <div className="relative z-10">
                <blockquote className="text-lg italic mb-8 font-medium">
                  {t('home.ctaSection.testimonial.quote')}
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-special-600 rounded-full"></div>
                  <div>
                    <p className="font-semibold">{t('home.ctaSection.testimonial.author')}</p>
                    <p className="text-sm text-special-100 font-medium">{t('home.ctaSection.testimonial.role')}</p>
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
