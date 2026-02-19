
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useUserRole } from "@/hooks/useUserRole";
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
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

/* ---------- Types ---------- */
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
  stage: "emerging" | "growing" | "blooming" | "shining";
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

/* ---------- Stage configuration ---------- */
const stages = {
  emerging: { icon: Sprout, label: "Emerging", color: "bg-amber-100 text-amber-700", emoji: "\uD83C\uDF31" },
  growing: { icon: Leaf, label: "Growing", color: "bg-green-100 text-green-700", emoji: "\uD83C\uDF3F" },
  blooming: { icon: Flower2, label: "Blooming", color: "bg-pink-100 text-pink-700", emoji: "\uD83C\uDF38" },
  shining: { icon: Star, label: "Shining", color: "bg-yellow-100 text-yellow-700", emoji: "\u2B50" },
};

/* ---------- Icon & color mappings ---------- */
const iconMap: Record<string, any> = {
  star: Star,
  "message-circle": MessageCircle,
  hand: Hand,
  footprints: Footprints,
  heart: Heart,
  home: Home,
  sparkles: Sparkles,
};

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

/* ---------- Zod schemas ---------- */
const journeySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  category_id: z.string().optional().default(""),
  stage: z.enum(["emerging", "growing", "blooming", "shining"]).default("emerging"),
  started_at: z.string().min(1, "Start date is required"),
});

const momentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional().default(""),
  how_we_celebrated: z.string().optional().default(""),
  moment_date: z.string().min(1, "Date is required"),
});

const editMomentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional().default(""),
  how_we_celebrated: z.string().optional().default(""),
  moment_date: z.string().min(1, "Date is required"),
});

type JourneyForm = z.infer<typeof journeySchema>;
type MomentForm = z.infer<typeof momentSchema>;
type EditMomentForm = z.infer<typeof editMomentSchema>;

const journeyDefaults: JourneyForm = {
  title: "",
  description: "",
  category_id: "",
  stage: "emerging",
  started_at: format(new Date(), "yyyy-MM-dd"),
};

const momentDefaults: MomentForm = {
  title: "",
  notes: "",
  how_we_celebrated: "",
  moment_date: format(new Date(), "yyyy-MM-dd"),
};

const editMomentDefaults: EditMomentForm = {
  title: "",
  notes: "",
  how_we_celebrated: "",
  moment_date: format(new Date(), "yyyy-MM-dd"),
};

/* ---------- Component ---------- */
const Celebrations = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedJourneys, setExpandedJourneys] = useState<Set<string>>(new Set());

  // Dialog states
  const [isJourneyDialogOpen, setIsJourneyDialogOpen] = useState(false);
  const [isMomentDialogOpen, setIsMomentDialogOpen] = useState(false);
  const [isMomentEditDialogOpen, setIsMomentEditDialogOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [selectedJourneyForMoment, setSelectedJourneyForMoment] = useState<Journey | null>(null);

  // Delete confirmation states
  const [deletingJourneyId, setDeletingJourneyId] = useState<string | null>(null);
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);

  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const { canEdit } = useUserRole();
  const queryClient = useQueryClient();

  /* ---------- React Hook Form instances ---------- */
  const journeyForm = useForm<JourneyForm>({
    resolver: zodResolver(journeySchema),
    defaultValues: journeyDefaults,
  });

  const momentForm = useForm<MomentForm>({
    resolver: zodResolver(momentSchema),
    defaultValues: momentDefaults,
  });

  const editMomentForm = useForm<EditMomentForm>({
    resolver: zodResolver(editMomentSchema),
    defaultValues: editMomentDefaults,
  });

  /* ---------- Categories query (seeds defaults if empty) ---------- */
  const { data: categories = [] } = useQuery({
    queryKey: ["celebrationCategories", activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("celebration_categories")
        .select("*")
        .eq("child_id", activeChild!.id)
        .order("sort_order");
      if (error) throw error;

      if (!data || data.length === 0) {
        await supabase.rpc("seed_celebration_categories", { p_child_id: activeChild!.id });
        const { data: seeded, error: seededError } = await supabase
          .from("celebration_categories")
          .select("*")
          .eq("child_id", activeChild!.id)
          .order("sort_order");
        if (seededError) throw seededError;
        return (seeded || []) as Category[];
      }
      return data as Category[];
    },
    enabled: !!user && !!activeChild,
  });

  /* ---------- Journeys query ---------- */
  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ["journeys", activeChild?.id],
    queryFn: async () => {
      const { data: journeysData, error: journeysError } = await supabase
        .from("journeys")
        .select("*")
        .eq("child_id", activeChild!.id)
        .order("updated_at", { ascending: false });
      if (journeysError) throw journeysError;

      const journeyIds = journeysData?.map((j) => j.id) || [];
      let momentsData: Moment[] = [];

      if (journeyIds.length > 0) {
        const { data: moments, error: momentsError } = await supabase
          .from("journey_moments")
          .select("*")
          .in("journey_id", journeyIds)
          .order("moment_date", { ascending: false });
        if (momentsError) throw momentsError;
        momentsData = (moments as Moment[]) || [];
      }

      return (
        journeysData?.map((journey) => ({
          ...journey,
          moments: momentsData.filter((m) => m.journey_id === journey.id),
          category: categories.find((c) => c.id === journey.category_id),
        })) || []
      ) as Journey[];
    },
    enabled: !!user && !!activeChild && categories.length > 0,
  });

  const invalidateJourneys = () => queryClient.invalidateQueries({ queryKey: ["journeys", activeChild?.id] });

  /* ---------- Toggle expansion ---------- */
  const toggleJourneyExpansion = (journeyId: string) => {
    setExpandedJourneys((prev) => {
      const next = new Set(prev);
      if (next.has(journeyId)) {
        next.delete(journeyId);
      } else {
        next.add(journeyId);
      }
      return next;
    });
  };

  /* ---------- Mutations ---------- */
  const journeyMutation = useMutation({
    mutationFn: async (formValues: JourneyForm) => {
      const journeyData = {
        child_id: activeChild!.id,
        title: formValues.title,
        description: formValues.description || null,
        category_id: formValues.category_id || null,
        stage: formValues.stage,
        started_at: formValues.started_at,
      };
      if (editingJourney) {
        const { error } = await supabase.from("journeys").update(journeyData).eq("id", editingJourney.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("journeys").insert([journeyData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidateJourneys();
      toast({
        title: editingJourney ? "Journey updated! \uD83C\uDF1F" : "New journey started! \uD83C\uDF89",
        description: editingJourney ? undefined : "Every step forward is a celebration!",
      });
      setIsJourneyDialogOpen(false);
      setEditingJourney(null);
      journeyForm.reset(journeyDefaults);
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const momentMutation = useMutation({
    mutationFn: async (formValues: MomentForm) => {
      const { error } = await supabase.from("journey_moments").insert([
        {
          journey_id: selectedJourneyForMoment!.id,
          child_id: activeChild!.id,
          title: formValues.title,
          notes: formValues.notes || null,
          how_we_celebrated: formValues.how_we_celebrated || null,
          moment_date: formValues.moment_date,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateJourneys();
      toast({ title: "Moment captured! \u2728", description: "What a wonderful achievement to remember!" });
      if (selectedJourneyForMoment)
        setExpandedJourneys((prev) => new Set(prev).add(selectedJourneyForMoment.id));
      setIsMomentDialogOpen(false);
      setSelectedJourneyForMoment(null);
      momentForm.reset(momentDefaults);
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteJourneyMutation = useMutation({
    mutationFn: async (journeyId: string) => {
      const { error } = await supabase.from("journeys").delete().eq("id", journeyId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateJourneys();
      toast({ title: "Journey removed" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const stageMutation = useMutation({
    mutationFn: async ({ journeyId, stage }: { journeyId: string; stage: string }) => {
      const { error } = await supabase.from("journeys").update({ stage }).eq("id", journeyId);
      if (error) throw error;
      return stage;
    },
    onSuccess: (stage) => {
      invalidateJourneys();
      const stageInfo = stages[stage as keyof typeof stages];
      toast({ title: `${stageInfo.emoji} Now ${stageInfo.label}!` });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMomentMutation = useMutation({
    mutationFn: async (momentId: string) => {
      const { error } = await supabase.from("journey_moments").delete().eq("id", momentId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateJourneys();
      toast({ title: "Moment removed" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const updateMomentMutation = useMutation({
    mutationFn: async (formValues: EditMomentForm) => {
      const { error } = await supabase
        .from("journey_moments")
        .update({
          title: formValues.title,
          notes: formValues.notes || null,
          how_we_celebrated: formValues.how_we_celebrated || null,
          moment_date: formValues.moment_date,
        })
        .eq("id", editingMoment!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateJourneys();
      toast({ title: "Moment updated! \u2728" });
      setIsMomentEditDialogOpen(false);
      setEditingMoment(null);
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  /* ---------- Handlers ---------- */
  const handleJourneySubmit = (values: JourneyForm) => {
    if (!user || !activeChild) return;
    journeyMutation.mutate(values);
  };

  const handleMomentSubmit = (values: MomentForm) => {
    if (!user || !activeChild || !selectedJourneyForMoment) return;
    momentMutation.mutate(values);
  };

  const handleStageUpdate = (journey: Journey, newStage: string) => {
    stageMutation.mutate({ journeyId: journey.id, stage: newStage });
  };

  const startEditMoment = (moment: Moment) => {
    setEditingMoment(moment);
    editMomentForm.reset({
      title: moment.title,
      notes: moment.notes || "",
      how_we_celebrated: moment.how_we_celebrated || "",
      moment_date: moment.moment_date,
    });
    setIsMomentEditDialogOpen(true);
  };

  const handleUpdateMoment = (values: EditMomentForm) => {
    if (!editingMoment) return;
    updateMomentMutation.mutate(values);
  };

  const confirmDeleteJourney = () => {
    if (deletingJourneyId) {
      deleteJourneyMutation.mutate(deletingJourneyId);
      setDeletingJourneyId(null);
    }
  };

  const confirmDeleteMoment = () => {
    if (deletingMomentId) {
      deleteMomentMutation.mutate(deletingMomentId);
      setDeletingMomentId(null);
    }
  };

  /* ---------- Filter & helpers ---------- */
  const filteredJourneys = journeys.filter(
    (j) => selectedCategory === "all" || j.category_id === selectedCategory
  );

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Star;
    return IconComponent;
  };

  /* ---------- Guards ---------- */
  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Celebrations</h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please select or create a child profile first.</AlertDescription>
        </Alert>
      </div>
    );
  }

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
        {canEdit && (
          <Button
            className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white"
            onClick={() => {
              setEditingJourney(null);
              journeyForm.reset({
                ...journeyDefaults,
                started_at: format(new Date(), "yyyy-MM-dd"),
              });
              setIsJourneyDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Start a Journey
          </Button>
        )}
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
                {journeys.filter((j) => j.stage === "shining").length}
              </p>
              <p className="text-sm text-green-600">Shining \u2B50</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-700">
                {journeys.filter((j) => j.stage === "emerging" || j.stage === "growing").length}
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
            {categories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.icon);
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className={`rounded-full px-4 data-[state=active]:${colorMap[cat.color]?.split(" ")[0] || "bg-special-100"}`}
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
          {filteredJourneys.map((journey) => {
            const isExpanded = expandedJourneys.has(journey.id);
            const stageInfo = stages[journey.stage];
            const StageIcon = stageInfo.icon;
            const category = categories.find((c) => c.id === journey.category_id);
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
                          Started {format(new Date(journey.started_at), "MMM d, yyyy")} \u2022{" "}
                          {journey.moments?.length || 0} moments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Stage selector */}
                      {canEdit ? (
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
                      ) : (
                        <Badge className={stageInfo.color}>
                          {stageInfo.emoji} {stageInfo.label}
                        </Badge>
                      )}

                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingJourney(journey);
                              journeyForm.reset({
                                title: journey.title,
                                description: journey.description || "",
                                category_id: journey.category_id || "",
                                stage: journey.stage as "emerging" | "growing" | "blooming" | "shining",
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
                            onClick={() => setDeletingJourneyId(journey.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Add Moment + Expand */}
                  <div className="flex items-center justify-between">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-special-600 border-special-200 hover:bg-special-50"
                        onClick={() => {
                          setSelectedJourneyForMoment(journey);
                          momentForm.reset({
                            ...momentDefaults,
                            moment_date: format(new Date(), "yyyy-MM-dd"),
                          });
                          setIsMomentDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Moment
                      </Button>
                    )}

                    {(journey.moments?.length || 0) > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => toggleJourneyExpansion(journey.id)}>
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Moments
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show {journey.moments?.length} Moment
                            {journey.moments?.length !== 1 ? "s" : ""}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Moments Timeline */}
                  {isExpanded && journey.moments && journey.moments.length > 0 && (
                    <div className="mt-4 ml-4 border-l-2 border-special-200 pl-4 space-y-4">
                      {journey.moments.map((moment) => (
                        <div key={moment.id} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-special-400 border-2 border-white" />

                          <div className="bg-special-50 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(moment.moment_date), "MMMM d, yyyy")}
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
                              {canEdit && (
                                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => startEditMoment(moment)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => setDeletingMomentId(moment.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
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
              Every achievement matters - big or small. Start a journey to track progress and celebrate the moments that
              make your child shine.
            </p>
            {canEdit && (
              <Button
                className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white"
                onClick={() => {
                  setEditingJourney(null);
                  journeyForm.reset({
                    ...journeyDefaults,
                    started_at: format(new Date(), "yyyy-MM-dd"),
                  });
                  setIsJourneyDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start Your First Journey
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---------- Journey Dialog ---------- */}
      <Dialog open={isJourneyDialogOpen} onOpenChange={setIsJourneyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              {editingJourney ? "Edit Journey" : "Start a New Journey"}
            </DialogTitle>
            <DialogDescription>
              {editingJourney
                ? "Update this journey's details"
                : "What skill or achievement would you like to track?"}
            </DialogDescription>
          </DialogHeader>

          <Form {...journeyForm}>
            <form onSubmit={journeyForm.handleSubmit(handleJourneySubmit)} className="space-y-4">
              <FormField
                control={journeyForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are you celebrating? *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Learning to use a spoon, Making eye contact, First words..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={journeyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any context or goals for this journey..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={journeyForm.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => {
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={journeyForm.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stage</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(stages).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              {info.emoji} {info.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={journeyForm.control}
                name="started_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When did this journey start?</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsJourneyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600"
                >
                  {editingJourney ? "Save Changes" : "Start Journey"} \uD83C\uDF1F
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---------- Moment Dialog ---------- */}
      <Dialog open={isMomentDialogOpen} onOpenChange={setIsMomentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-pink-500" />
              Capture a Moment
            </DialogTitle>
            <DialogDescription>
              {selectedJourneyForMoment && (
                <>
                  Record a progress moment for <strong>{selectedJourneyForMoment.title}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...momentForm}>
            <form onSubmit={momentForm.handleSubmit(handleMomentSubmit)} className="space-y-4">
              <FormField
                control={momentForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What happened? *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Held the spoon by herself!, Said 'mama' clearly..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={momentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>The story (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What led to this moment? How did it happen?"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={momentForm.control}
                name="how_we_celebrated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you celebrate? (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Big hugs and happy dance!, Ice cream treat..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={momentForm.control}
                name="moment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When did this happen?</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMomentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  Save Moment \u2728
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---------- Moment Edit Dialog ---------- */}
      <Dialog open={isMomentEditDialogOpen} onOpenChange={setIsMomentEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-special-500" />
              Edit Moment
            </DialogTitle>
            <DialogDescription>Update the details of this moment</DialogDescription>
          </DialogHeader>

          <Form {...editMomentForm}>
            <form onSubmit={editMomentForm.handleSubmit(handleUpdateMoment)} className="space-y-4">
              <FormField
                control={editMomentForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What happened? *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Held the spoon by herself!..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editMomentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>The story (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What led to this moment? How did it happen?"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editMomentForm.control}
                name="how_we_celebrated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you celebrate? (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Big hugs and happy dance!..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editMomentForm.control}
                name="moment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When did this happen?</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMomentEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  Save Changes \u2728
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---------- Delete Journey AlertDialog ---------- */}
      <AlertDialog open={deletingJourneyId !== null} onOpenChange={(open) => !open && setDeletingJourneyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journey?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this journey and all its moments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteJourney}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---------- Delete Moment AlertDialog ---------- */}
      <AlertDialog open={deletingMomentId !== null} onOpenChange={(open) => !open && setDeletingMomentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Moment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this moment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteMoment}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Celebrations;
