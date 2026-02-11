
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import {
  Star,
  Plus,
  Sparkles,
  MessageCircle,
  Hand,
  Footprints,
  Heart,
  Home,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Trash2,
  PartyPopper,
  Calendar,
  Sprout,
  Leaf,
  Flower2,
} from "lucide-react";
import { format } from "date-fns";

// Types
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Journey {
  id: string;
  child_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  stage: 'emerging' | 'growing' | 'blooming' | 'shining';
  is_starred: boolean;
  started_at: string;
  created_at: string;
  moments?: Moment[];
  category?: Category;
}

interface Moment {
  id: string;
  journey_id: string;
  child_id: string;
  title: string;
  notes: string | null;
  how_we_celebrated: string | null;
  photo_url: string | null;
  moment_date: string;
  created_at: string;
}

// Stage configuration
const stages = {
  emerging: { icon: Sprout, label: 'Emerging', color: 'bg-amber-100 text-amber-700', emoji: '🌱' },
  growing: { icon: Leaf, label: 'Growing', color: 'bg-green-100 text-green-700', emoji: '🌿' },
  blooming: { icon: Flower2, label: 'Blooming', color: 'bg-pink-100 text-pink-700', emoji: '🌸' },
  shining: { icon: Star, label: 'Shining', color: 'bg-yellow-100 text-yellow-700', emoji: '⭐' },
};

// Icon mapping
const iconMap: Record<string, any> = {
  'star': Star,
  'message-circle': MessageCircle,
  'hand': Hand,
  'footprints': Footprints,
  'heart': Heart,
  'home': Home,
  'sparkles': Sparkles,
};

// Color mapping
const colorMap: Record<string, string> = {
  'yellow': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'blue': 'bg-blue-100 text-blue-700 border-blue-200',
  'green': 'bg-green-100 text-green-700 border-green-200',
  'orange': 'bg-orange-100 text-orange-700 border-orange-200',
  'pink': 'bg-pink-100 text-pink-700 border-pink-200',
  'purple': 'bg-purple-100 text-purple-700 border-purple-200',
};

const Celebrations = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedJourneys, setExpandedJourneys] = useState<Set<string>>(new Set());

  // Dialog states
  const [isJourneyDialogOpen, setIsJourneyDialogOpen] = useState(false);
  const [isMomentDialogOpen, setIsMomentDialogOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [selectedJourneyForMoment, setSelectedJourneyForMoment] = useState<Journey | null>(null);

  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();

  // Form states
  const [journeyForm, setJourneyForm] = useState({
    title: '',
    description: '',
    category_id: '',
    stage: 'emerging' as 'emerging' | 'growing' | 'blooming' | 'shining',
    started_at: format(new Date(), 'yyyy-MM-dd'),
  });

  const [momentForm, setMomentForm] = useState({
    title: '',
    notes: '',
    how_we_celebrated: '',
    moment_date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Seed default categories if none exist
  const seedCategories = async () => {
    if (!activeChild) return;

    try {
      const { error } = await (supabase.rpc as any)('seed_celebration_categories', {
        p_child_id: activeChild.id
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error seeding categories:', error.message);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!user || !activeChild) return;

    try {
      const { data, error } = await (supabase
        .from('celebration_categories') as any)
        .select('*')
        .eq('child_id', activeChild.id)
        .order('sort_order');

      if (error) throw error;

      // If no categories, seed defaults
      if (!data || data.length === 0) {
        await seedCategories();
        // Fetch again after seeding
        const { data: seededData, error: seededError } = await (supabase
          .from('celebration_categories') as any)
          .select('*')
          .eq('child_id', activeChild.id)
          .order('sort_order');
        if (seededError) throw seededError;
        setCategories(seededData || []);
      } else {
        setCategories(data as Category[]);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Fetch journeys with moments
  const fetchJourneys = async () => {
    if (!user || !activeChild) return;

    try {
      // Fetch journeys
      const { data: journeysData, error: journeysError } = await (supabase
        .from('journeys') as any)
        .select('*')
        .eq('child_id', activeChild.id)
        .order('updated_at', { ascending: false });

      if (journeysError) throw journeysError;

      // Fetch all moments for these journeys
      const journeyIds = (journeysData as any[])?.map((j: any) => j.id) || [];
      let momentsData: Moment[] = [];

      if (journeyIds.length > 0) {
        const { data: moments, error: momentsError } = await (supabase
          .from('journey_moments') as any)
          .select('*')
          .in('journey_id', journeyIds)
          .order('moment_date', { ascending: false });

        if (momentsError) throw momentsError;
        momentsData = (moments as Moment[]) || [];
      }

      // Combine journeys with their moments and categories
      const journeysWithData = (journeysData as any[])?.map((journey: any) => ({
        ...journey,
        moments: momentsData.filter(m => m.journey_id === journey.id),
        category: categories.find(c => c.id === journey.category_id),
      })) || [];

      setJourneys(journeysWithData as Journey[]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeChild) {
      setIsLoading(true);
      fetchCategories();
    } else if (!activeChild) {
      setIsLoading(false);
    }
  }, [user, activeChild?.id]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchJourneys();
    }
  }, [categories]);

  // Toggle journey expansion
  const toggleJourneyExpansion = (journeyId: string) => {
    setExpandedJourneys(prev => {
      const next = new Set(prev);
      if (next.has(journeyId)) {
        next.delete(journeyId);
      } else {
        next.add(journeyId);
      }
      return next;
    });
  };

  // Create/Update Journey
  const handleJourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChild || !journeyForm.title.trim()) return;

    try {
      const journeyData = {
        child_id: activeChild.id,
        title: journeyForm.title,
        description: journeyForm.description || null,
        category_id: journeyForm.category_id || null,
        stage: journeyForm.stage,
        started_at: journeyForm.started_at,
      };

      if (editingJourney) {
        const { error } = await (supabase
          .from('journeys') as any)
          .update(journeyData)
          .eq('id', editingJourney.id);
        if (error) throw error;
        toast({ title: "Journey updated! 🌟" });
      } else {
        const { error } = await (supabase
          .from('journeys') as any)
          .insert([journeyData]);
        if (error) throw error;
        toast({ title: "New journey started! 🎉", description: "Every step forward is a celebration!" });
      }

      setIsJourneyDialogOpen(false);
      setEditingJourney(null);
      setJourneyForm({
        title: '',
        description: '',
        category_id: '',
        stage: 'emerging',
        started_at: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchJourneys();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Add Moment
  const handleMomentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChild || !selectedJourneyForMoment || !momentForm.title.trim()) return;

    try {
      const { error } = await (supabase
        .from('journey_moments') as any)
        .insert([{
          journey_id: selectedJourneyForMoment.id,
          child_id: activeChild.id,
          title: momentForm.title,
          notes: momentForm.notes || null,
          how_we_celebrated: momentForm.how_we_celebrated || null,
          moment_date: momentForm.moment_date,
        }]);

      if (error) throw error;

      toast({
        title: "Moment captured! ✨",
        description: "What a wonderful achievement to remember!"
      });

      setIsMomentDialogOpen(false);
      setSelectedJourneyForMoment(null);
      setMomentForm({
        title: '',
        notes: '',
        how_we_celebrated: '',
        moment_date: format(new Date(), 'yyyy-MM-dd'),
      });

      // Expand the journey to show the new moment
      setExpandedJourneys(prev => new Set(prev).add(selectedJourneyForMoment.id));
      fetchJourneys();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Delete Journey
  const handleDeleteJourney = async (journey: Journey) => {
    if (!confirm('Delete this journey and all its moments?')) return;

    try {
      const { error } = await (supabase
        .from('journeys') as any)
        .delete()
        .eq('id', journey.id);
      if (error) throw error;

      toast({ title: "Journey removed" });
      fetchJourneys();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Update Journey Stage
  const handleStageUpdate = async (journey: Journey, newStage: string) => {
    try {
      const { error } = await (supabase
        .from('journeys') as any)
        .update({ stage: newStage })
        .eq('id', journey.id);
      if (error) throw error;

      const stageInfo = stages[newStage as keyof typeof stages];
      toast({ title: `${stageInfo.emoji} Now ${stageInfo.label}!` });
      fetchJourneys();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Filter journeys
  const filteredJourneys = journeys.filter(j =>
    selectedCategory === 'all' || j.category_id === selectedCategory
  );

  // Get category icon component
  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Star;
    return IconComponent;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-special-600" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-pink-100 flex items-center justify-center">
            <PartyPopper className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Celebrations</h2>
            <p className="text-muted-foreground">Every achievement is a journey worth celebrating</p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white"
          onClick={() => {
            setEditingJourney(null);
            setJourneyForm({
              title: '',
              description: '',
              category_id: '',
              stage: 'emerging',
              started_at: format(new Date(), 'yyyy-MM-dd'),
            });
            setIsJourneyDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Start a Journey
        </Button>
      </div>

      {/* Stats */}
      {journeys.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{journeys.length}</p>
              <p className="text-sm text-yellow-600">Journeys</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-pink-700">
                {journeys.reduce((sum, j) => sum + (j.moments?.length || 0), 0)}
              </p>
              <p className="text-sm text-pink-600">Moments</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-700">
                {journeys.filter(j => j.stage === 'shining').length}
              </p>
              <p className="text-sm text-green-600">Shining ⭐</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-700">
                {journeys.filter(j => j.stage === 'emerging' || j.stage === 'growing').length}
              </p>
              <p className="text-sm text-purple-600">In Progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Filters */}
      {categories.length > 0 && (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-special-100 data-[state=active]:text-special-700 rounded-full px-4"
            >
              All
            </TabsTrigger>
            {categories.map(cat => {
              const IconComponent = getCategoryIcon(cat.icon);
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className={`rounded-full px-4 data-[state=active]:${colorMap[cat.color]?.split(' ')[0] || 'bg-special-100'}`}
                >
                  <IconComponent className="h-4 w-4 mr-1" />
                  {cat.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Journeys List */}
      {filteredJourneys.length > 0 ? (
        <div className="space-y-4">
          {filteredJourneys.map(journey => {
            const isExpanded = expandedJourneys.has(journey.id);
            const stageInfo = stages[journey.stage];
            const StageIcon = stageInfo.icon;
            const category = categories.find(c => c.id === journey.category_id);
            const CategoryIcon = category ? getCategoryIcon(category.icon) : Star;

            return (
              <Card key={journey.id} className="bg-white overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Stage indicator */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stageInfo.color}`}>
                        <StageIcon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {category && (
                            <Badge variant="outline" className={colorMap[category.color]}>
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {category.name}
                            </Badge>
                          )}
                          <Badge className={stageInfo.color}>
                            {stageInfo.emoji} {stageInfo.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{journey.title}</CardTitle>
                        {journey.description && (
                          <CardDescription className="mt-1">{journey.description}</CardDescription>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Started {format(new Date(journey.started_at), 'MMM d, yyyy')} • {journey.moments?.length || 0} moments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Stage selector */}
                      <Select
                        value={journey.stage}
                        onValueChange={(value) => handleStageUpdate(journey, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(stages).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              {info.emoji} {info.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingJourney(journey);
                          setJourneyForm({
                            title: journey.title,
                            description: journey.description || '',
                            category_id: journey.category_id || '',
                            stage: journey.stage as 'emerging' | 'growing' | 'blooming' | 'shining',
                            started_at: journey.started_at,
                          });
                          setIsJourneyDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteJourney(journey)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Add Moment + Expand */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-special-600 border-special-200 hover:bg-special-50"
                      onClick={() => {
                        setSelectedJourneyForMoment(journey);
                        setMomentForm({
                          title: '',
                          notes: '',
                          how_we_celebrated: '',
                          moment_date: format(new Date(), 'yyyy-MM-dd'),
                        });
                        setIsMomentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Moment
                    </Button>

                    {(journey.moments?.length || 0) > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJourneyExpansion(journey.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Moments
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show {journey.moments?.length} Moment{journey.moments?.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Moments Timeline */}
                  {isExpanded && journey.moments && journey.moments.length > 0 && (
                    <div className="mt-4 ml-4 border-l-2 border-special-200 pl-4 space-y-4">
                      {journey.moments.map((moment, idx) => (
                        <div key={moment.id} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-special-400 border-2 border-white" />

                          <div className="bg-special-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(moment.moment_date), 'MMMM d, yyyy')}
                            </div>
                            <p className="font-medium text-foreground">{moment.title}</p>
                            {moment.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{moment.notes}</p>
                            )}
                            {moment.how_we_celebrated && (
                              <p className="text-sm text-pink-600 mt-2 flex items-center gap-1">
                                <PartyPopper className="h-3 w-3" />
                                {moment.how_we_celebrated}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center py-16 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
          <CardContent>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-pink-600 bg-clip-text text-transparent">
              Start Celebrating!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Every achievement matters - big or small. Start a journey to track progress
              and celebrate the moments that make your child shine.
            </p>
            <Button
              className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white"
              onClick={() => setIsJourneyDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Your First Journey
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Journey Dialog */}
      <Dialog open={isJourneyDialogOpen} onOpenChange={setIsJourneyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              {editingJourney ? 'Edit Journey' : 'Start a New Journey'}
            </DialogTitle>
            <DialogDescription>
              {editingJourney
                ? 'Update this journey\'s details'
                : 'What skill or achievement would you like to track?'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJourneySubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">What are you celebrating? *</Label>
              <Input
                id="title"
                value={journeyForm.title}
                onChange={(e) => setJourneyForm({ ...journeyForm, title: e.target.value })}
                placeholder="e.g., Learning to use a spoon, Making eye contact, First words..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={journeyForm.description}
                onChange={(e) => setJourneyForm({ ...journeyForm, description: e.target.value })}
                placeholder="Any context or goals for this journey..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={journeyForm.category_id}
                  onValueChange={(value) => setJourneyForm({ ...journeyForm, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => {
                      const IconComponent = getCategoryIcon(cat.icon);
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {cat.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Current Stage</Label>
                <Select
                  value={journeyForm.stage}
                  onValueChange={(value: any) => setJourneyForm({ ...journeyForm, stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stages).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.emoji} {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="started_at">When did this journey start?</Label>
              <Input
                id="started_at"
                type="date"
                value={journeyForm.started_at}
                onChange={(e) => setJourneyForm({ ...journeyForm, started_at: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsJourneyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600"
              >
                {editingJourney ? 'Save Changes' : 'Start Journey'} 🌟
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Moment Dialog */}
      <Dialog open={isMomentDialogOpen} onOpenChange={setIsMomentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-pink-500" />
              Capture a Moment
            </DialogTitle>
            <DialogDescription>
              {selectedJourneyForMoment && (
                <>Record a progress moment for <strong>{selectedJourneyForMoment.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleMomentSubmit} className="space-y-4">
            <div>
              <Label htmlFor="moment_title">What happened? *</Label>
              <Input
                id="moment_title"
                value={momentForm.title}
                onChange={(e) => setMomentForm({ ...momentForm, title: e.target.value })}
                placeholder="e.g., Held the spoon by herself!, Said 'mama' clearly..."
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">The story (optional)</Label>
              <Textarea
                id="notes"
                value={momentForm.notes}
                onChange={(e) => setMomentForm({ ...momentForm, notes: e.target.value })}
                placeholder="What led to this moment? How did it happen?"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="celebration">How did you celebrate? (optional)</Label>
              <Input
                id="celebration"
                value={momentForm.how_we_celebrated}
                onChange={(e) => setMomentForm({ ...momentForm, how_we_celebrated: e.target.value })}
                placeholder="e.g., Big hugs and happy dance!, Ice cream treat..."
              />
            </div>

            <div>
              <Label htmlFor="moment_date">When did this happen?</Label>
              <Input
                id="moment_date"
                type="date"
                value={momentForm.moment_date}
                onChange={(e) => setMomentForm({ ...momentForm, moment_date: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMomentDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Save Moment ✨
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Celebrations;
