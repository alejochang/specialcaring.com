import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building, Users, GraduationCap, Heart, Phone, MapPin, Clock, ExternalLink,
  Bookmark, BookmarkCheck, Star, Calendar, Loader2, AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

const CommunityServices = () => {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();
  const queryKey = ['savedCommunityServices', activeChild?.id];

  const { data: savedServices = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_community_services')
        .select('service_id')
        .eq('child_id', activeChild!.id);
      if (error) throw error;
      return (data || []).map((d: any) => d.service_id) as string[];
    },
    enabled: !!user && !!activeChild,
  });

  const toggleMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const isSaved = savedServices.includes(serviceId);
      if (isSaved) {
        const { error } = await supabase.from('saved_community_services').delete()
          .eq('service_id', serviceId).eq('created_by', user!.id).eq('child_id', activeChild!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('saved_community_services')
          .insert([{ created_by: user!.id, child_id: activeChild!.id, service_id: serviceId }]);
        if (error) throw error;
      }
    },
    onMutate: async (serviceId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData<string[]>(queryKey, (old = []) =>
        old.includes(serviceId) ? old.filter(id => id !== serviceId) : [...old, serviceId]
      );
      return { previous };
    },
    onError: (_error: any, _serviceId, context: any) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast({ title: "Error", description: _error.message, variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleSaved = (serviceId: string) => {
    if (!user || !activeChild) return;
    toggleMutation.mutate(serviceId);
  };

  const educationServices = [
    {
      id: "early-intervention",
      name: "Early Intervention Program",
      description: "Developmental support for children 0-3 years old",
      category: "Education",
      rating: 4.8,
      contact: "(555) 123-4567",
      address: "123 Learning Center Dr",
      hours: "Mon-Fri 8AM-5PM",
      website: "earlyintervention.org",
      tags: ["0-3 years", "Speech Therapy", "Occupational Therapy"]
    },
    {
      id: "special-education",
      name: "Special Education Resource Center",
      description: "Educational advocacy and support services",
      category: "Education",
      rating: 4.6,
      contact: "(555) 234-5678",
      address: "456 Education Blvd",
      hours: "Mon-Fri 9AM-4PM",
      website: "specialeducation.org",
      tags: ["IEP Support", "Advocacy", "All Ages"]
    },
    {
      id: "inclusive-school",
      name: "Sunshine Inclusive Learning Academy",
      description: "Private school specializing in inclusive education",
      category: "Education",
      rating: 4.9,
      contact: "(555) 345-6789",
      address: "789 Inclusive Way",
      hours: "Mon-Fri 8AM-3PM",
      website: "sunshineacademy.edu",
      tags: ["K-12", "Inclusive", "Small Classes"]
    }
  ];

  const healthServices = [
    {
      id: "developmental-pediatrics",
      name: "Children's Developmental Center",
      description: "Comprehensive developmental assessments and therapies",
      category: "Healthcare",
      rating: 4.7,
      contact: "(555) 456-7890",
      address: "321 Medical Plaza",
      hours: "Mon-Fri 7AM-6PM",
      website: "childrensdevelopmental.org",
      tags: ["Autism", "ADHD", "Developmental Delays"]
    },
    {
      id: "therapy-center",
      name: "Pediatric Therapy Partners",
      description: "Speech, occupational, and physical therapy services",
      category: "Healthcare",
      rating: 4.8,
      contact: "(555) 567-8901",
      address: "654 Therapy Lane",
      hours: "Mon-Sat 8AM-7PM",
      website: "therapypartners.com",
      tags: ["Speech", "OT", "PT", "ABA"]
    },
    {
      id: "mental-health",
      name: "Family Behavioral Health Services",
      description: "Mental health support for children and families",
      category: "Healthcare",
      rating: 4.5,
      contact: "(555) 678-9012",
      address: "987 Wellness Dr",
      hours: "Mon-Fri 9AM-8PM, Sat 9AM-3PM",
      website: "familybehavioral.org",
      tags: ["Counseling", "Family Therapy", "Crisis Support"]
    }
  ];

  const supportServices = [
    {
      id: "respite-care",
      name: "Caring Hearts Respite Services",
      description: "Temporary care to give family caregivers a break",
      category: "Support",
      rating: 4.9,
      contact: "(555) 789-0123",
      address: "147 Comfort St",
      hours: "24/7 Available",
      website: "caringhearts.org",
      tags: ["Respite", "24/7", "Trained Staff"]
    },
    {
      id: "parent-support",
      name: "Special Needs Parent Network",
      description: "Support groups and resources for parents",
      category: "Support",
      rating: 4.6,
      contact: "(555) 890-1234",
      address: "258 Community Center Ave",
      hours: "Various meeting times",
      website: "parentnetwork.org",
      tags: ["Support Groups", "Workshops", "Peer Support"]
    },
    {
      id: "advocacy",
      name: "Disability Rights Advocacy Center",
      description: "Legal advocacy and rights protection services",
      category: "Support",
      rating: 4.7,
      contact: "(555) 901-2345",
      address: "369 Justice Blvd",
      hours: "Mon-Fri 9AM-5PM",
      website: "disabilityadvocacy.org",
      tags: ["Legal", "Rights", "Advocacy"]
    }
  ];

  const recreationServices = [
    {
      id: "adaptive-sports",
      name: "Adaptive Sports League",
      description: "Sports programs adapted for children with disabilities",
      category: "Recreation",
      rating: 4.8,
      contact: "(555) 012-3456",
      address: "741 Sports Complex Dr",
      hours: "Weekends & Evenings",
      website: "adaptivesports.org",
      tags: ["Sports", "Adaptive", "Team Building"]
    },
    {
      id: "arts-program",
      name: "Creative Abilities Arts Center",
      description: "Art, music, and drama programs for all abilities",
      category: "Recreation",
      rating: 4.7,
      contact: "(555) 123-0456",
      address: "852 Arts District",
      hours: "Mon-Sat 10AM-8PM",
      website: "creativeabilities.org",
      tags: ["Arts", "Music", "Drama", "Inclusive"]
    },
    {
      id: "summer-camp",
      name: "Camp Special Adventures",
      description: "Summer camp program for children with special needs",
      category: "Recreation",
      rating: 4.9,
      contact: "(555) 234-1567",
      address: "963 Nature Trail Rd",
      hours: "Summer Season",
      website: "campspecialadventures.org",
      tags: ["Summer Camp", "Nature", "1:1 Support"]
    }
  ];

  const ServiceCard = ({ service, category }: { service: any, category: string }) => {
    const isSaved = savedServices.includes(service.id);

    return (
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="mb-2">
              {category}
            </Badge>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSaved(service.id)}
                className="h-8 w-8 p-0"
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-special-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <CardTitle className="text-lg leading-tight">{service.name}</CardTitle>
          <CardDescription>{service.description}</CardDescription>
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{service.rating}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{service.contact}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{service.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{service.hours}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {service.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <Calendar className="h-4 w-4 mr-1" />
              Contact
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${service.website}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Community Services</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please select or create a child profile first.</AlertDescription></Alert>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-special-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Community Services</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover local resources, services, and support programs designed to help families caring for children with special needs.
        </p>
      </div>

      <Tabs defaultValue="education" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Healthcare</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger value="recreation" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Recreation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="education" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {educationServices.map((service) => (
              <ServiceCard key={service.id} service={service} category="Education" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {healthServices.map((service) => (
              <ServiceCard key={service.id} service={service} category="Healthcare" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {supportServices.map((service) => (
              <ServiceCard key={service.id} service={service} category="Support" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recreation" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recreationServices.map((service) => (
              <ServiceCard key={service.id} service={service} category="Recreation" />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {savedServices.length > 0 && (
        <Card className="bg-special-50 border-special-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-special-600" />
              Saved Services ({savedServices.length})
            </CardTitle>
            <CardDescription>
              Services you've bookmarked for easy access
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default CommunityServices;
