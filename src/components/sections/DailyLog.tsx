
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar, Plus, Heart, Pill, Utensils, Moon, Smile, Frown, Meh,
  AlertCircle, Star, Activity, BookOpen, Users, Edit, Loader2, Trash2
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

interface LogEntry {
  id: string;
  date: string;
  time: string;
  category: string;
  mood: 'happy' | 'neutral' | 'sad';
  title: string;
  description: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const entrySchema = z.object({
  category: z.string().min(1, "Category is required"),
  mood: z.enum(['happy', 'neutral', 'sad']),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

type EntryFormValues = z.infer<typeof entrySchema>;

const categories = [
  { id: 'medical', label: 'Medical', icon: Heart, color: 'bg-red-100 text-red-700' },
  { id: 'medication', label: 'Medication', icon: Pill, color: 'bg-purple-100 text-purple-700' },
  { id: 'meals', label: 'Meals & Nutrition', icon: Utensils, color: 'bg-green-100 text-green-700' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: 'bg-blue-100 text-blue-700' },
  { id: 'behavior', label: 'Behavior', icon: Activity, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'therapy', label: 'Therapy/Education', icon: BookOpen, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'social', label: 'Social', icon: Users, color: 'bg-pink-100 text-pink-700' },
  { id: 'milestone', label: 'Milestone', icon: Star, color: 'bg-orange-100 text-orange-700' },
];

const moodIcons = {
  happy: { icon: Smile, color: 'text-green-500', label: 'Happy' },
  neutral: { icon: Meh, color: 'text-yellow-500', label: 'Neutral' },
  sad: { icon: Frown, color: 'text-red-500', label: 'Challenging' }
};

const DailyLog = () => {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEdit } = useUserRole();

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: { category: '', mood: 'neutral', title: '', description: '', priority: 'medium' },
  });

  const watchCategory = form.watch('category');
  const watchMood = form.watch('mood');
  const watchPriority = form.watch('priority');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['dailyLogEntries', activeChild?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_log_entries')
        .select('*')
        .eq('child_id', activeChild!.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id, date: d.date, time: d.time, category: d.category,
        mood: d.mood as 'happy' | 'neutral' | 'sad', title: d.title,
        description: d.description || '', tags: d.tags || [],
        priority: d.priority as 'low' | 'medium' | 'high',
      })) as LogEntry[];
    },
    enabled: !!user && !!activeChild,
  });

  const addMutation = useMutation({
    mutationFn: async (values: EntryFormValues) => {
      const { error } = await supabase.from('daily_log_entries').insert([{
        user_id: user!.id, child_id: activeChild!.id,
        date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'),
        category: values.category, mood: values.mood, title: values.title,
        description: values.description || '', tags: [], priority: values.priority,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLogEntries', activeChild?.id] });
      form.reset();
      setShowNewEntry(false);
      toast({ title: "Entry added", description: "Daily log entry saved." });
    },
    onError: (error: any) => toast({ title: "Error saving entry", description: error.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: EntryFormValues) => {
      const { error } = await supabase.from('daily_log_entries').update({
        category: values.category, mood: values.mood, title: values.title,
        description: values.description || '', priority: values.priority,
      }).eq('id', editingEntry!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLogEntries', activeChild?.id] });
      setEditingEntry(null);
      setShowNewEntry(false);
      form.reset();
      toast({ title: "Entry updated" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('daily_log_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLogEntries', activeChild?.id] });
      toast({ title: "Entry deleted" });
    },
    onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const onSubmit = (values: EntryFormValues) => {
    if (!user || !activeChild) return;
    if (editingEntry) {
      updateMutation.mutate(values);
    } else {
      addMutation.mutate(values);
    }
  };

  const startEditEntry = (entry: LogEntry) => {
    setEditingEntry(entry);
    form.reset({ category: entry.category, mood: entry.mood, title: entry.title, description: entry.description, priority: entry.priority });
    setShowNewEntry(true);
  };

  const getCategoryInfo = (categoryId: string) => categories.find(c => c.id === categoryId) || categories[0];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // no-child guard
  if (!activeChild) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Daily Log</h2>
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please select or create a child profile first.</AlertDescription></Alert>
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

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayEntries = entries.filter(entry => entry.date === todayStr);
  const weekEntries = entries.filter(entry => isAfter(new Date(entry.date), subDays(new Date(), 7)));

  const overallMood = todayEntries.length > 0
    ? todayEntries.reduce((acc, entry) => {
        if (entry.mood === 'happy') return acc + 1;
        if (entry.mood === 'sad') return acc - 1;
        return acc;
      }, 0) > 0 ? 'positive' : todayEntries.some(e => e.mood === 'sad') ? 'challenging' : 'stable'
    : 'no-entries';

  const renderEntries = (entriesToRender: LogEntry[]) => (
    entriesToRender.length === 0 ? (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">No entries found.</p>
          {canEdit && (
            <Button className="mt-4" onClick={() => setShowNewEntry(true)}>
              Create an entry
            </Button>
          )}
        </CardContent>
      </Card>
    ) : (
      entriesToRender.map((entry) => {
        const categoryInfo = getCategoryInfo(entry.category);
        const CategoryIcon = categoryInfo.icon;
        const moodInfo = moodIcons[entry.mood];
        const MoodIcon = moodInfo.icon;

        return (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{entry.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{entry.date} {entry.time}</span>
                      <span>•</span>
                      <span>{categoryInfo.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MoodIcon className={`h-5 w-5 ${moodInfo.color}`} />
                  <Badge className={getPriorityColor(entry.priority)}>
                    {entry.priority}
                  </Badge>
                  {canEdit && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditEntry(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingId(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {entry.description && (
                <p className="text-muted-foreground mb-3">{entry.description}</p>
              )}

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daily Log</h1>
          <p className="text-muted-foreground">
            Track daily activities, behaviors, and milestones
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => { form.reset(); setEditingEntry(null); setShowNewEntry(true); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        )}
      </div>

      {/* Today's Summary */}
      <Card className="bg-gradient-to-r from-special-50 to-purple-50 border-special-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-special-600" />
            Today's Summary - {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-special-600">{todayEntries.length}</div>
              <div className="text-sm text-muted-foreground">Entries Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {overallMood === 'positive' && <span className="text-green-600">Positive Day</span>}
                {overallMood === 'stable' && <span className="text-yellow-600">Stable Day</span>}
                {overallMood === 'challenging' && <span className="text-red-600">Challenging Day</span>}
                {overallMood === 'no-entries' && <span className="text-gray-600">No entries yet</span>}
              </div>
              <div className="text-sm text-muted-foreground">Overall Mood</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {todayEntries.filter(e => e.priority === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">Important Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Entry Form */}
      {showNewEntry && canEdit && (
        <Card className="border-special-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            type="button"
                            key={category.id}
                            onClick={() => form.setValue('category', category.id, { shouldValidate: true })}
                            className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 text-sm ${
                              watchCategory === category.id
                                ? 'border-special-500 bg-special-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {category.label}
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.category && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Mood</label>
                    <div className="flex gap-2">
                      {Object.entries(moodIcons).map(([mood, info]) => {
                        const Icon = info.icon;
                        return (
                          <button
                            type="button"
                            key={mood}
                            onClick={() => form.setValue('mood', mood as 'happy' | 'neutral' | 'sad')}
                            className={`p-3 rounded-lg border-2 flex-1 transition-all ${
                              watchMood === mood
                                ? 'border-special-500 bg-special-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`h-6 w-6 mx-auto ${info.color}`} />
                            <div className="text-xs mt-1">{info.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Brief description of what happened..."
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Details</label>
                  <Textarea
                    placeholder="Provide more details about the event, behavior, or observation..."
                    {...form.register('description')}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'low' as const, label: 'Low', color: 'bg-green-100 text-green-700' },
                      { value: 'medium' as const, label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                      { value: 'high' as const, label: 'Important', color: 'bg-red-100 text-red-700' }
                    ].map((priority) => (
                      <button
                        type="button"
                        key={priority.value}
                        onClick={() => form.setValue('priority', priority.value)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          watchPriority === priority.value
                            ? 'border-special-500 bg-special-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={!form.formState.isValid}>
                    {editingEntry ? 'Update Entry' : 'Add Entry'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowNewEntry(false);
                    setEditingEntry(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Entries */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="all">All Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {renderEntries(todayEntries)}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          {renderEntries(weekEntries)}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {renderEntries(entries)}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The log entry will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deletingId) { deleteMutation.mutate(deletingId); setDeletingId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DailyLog;
