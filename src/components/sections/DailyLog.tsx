
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Plus,
  Heart,
  Pill,
  Utensils,
  Moon,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Star,
  Activity,
  BookOpen,
  Users,
  Edit,
  Loader2,
  Trash2
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChild } from "@/contexts/ChildContext";
import { useToast } from "@/hooks/use-toast";

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
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { toast } = useToast();
  const [newEntry, setNewEntry] = useState({
    category: '',
    mood: 'neutral' as 'happy' | 'neutral' | 'sad',
    title: '',
    description: '',
    tags: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    if (user && activeChild) {
      fetchEntries();
    } else if (!activeChild) {
      setIsLoading(false);
    }
  }, [user, activeChild?.id]);

  const fetchEntries = async () => {
    if (!user || !activeChild) return;
    try {
      const { data, error } = await supabase
        .from('daily_log_entries')
        .select('*')
        .eq('child_id', activeChild.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });
      if (error) throw error;
      setEntries((data || []).map((d: any) => ({
        id: d.id,
        date: d.date,
        time: d.time,
        category: d.category,
        mood: d.mood as 'happy' | 'neutral' | 'sad',
        title: d.title,
        description: d.description || '',
        tags: d.tags || [],
        priority: d.priority as 'low' | 'medium' | 'high',
      })));
    } catch (error: any) {
      toast({ title: "Error loading entries", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.category || !user || !activeChild) return;
    
    const entryData = {
      user_id: user.id,
      child_id: activeChild.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      category: newEntry.category,
      mood: newEntry.mood,
      title: newEntry.title,
      description: newEntry.description,
      tags: newEntry.tags,
      priority: newEntry.priority,
    };

    try {
      const { data, error } = await supabase
        .from('daily_log_entries')
        .insert([entryData])
        .select()
        .single();
      if (error) throw error;

      setEntries(prev => [{
        id: data.id,
        date: data.date,
        time: data.time,
        category: data.category,
        mood: data.mood as any,
        title: data.title,
        description: data.description || '',
        tags: data.tags || [],
        priority: data.priority as any,
      }, ...prev]);
      setNewEntry({ category: '', mood: 'neutral', title: '', description: '', tags: [], priority: 'medium' });
      setShowNewEntry(false);
      toast({ title: "Entry added", description: "Daily log entry saved." });
    } catch (error: any) {
      toast({ title: "Error saving entry", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('daily_log_entries').delete().eq('id', id);
      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== id));
      toast({ title: "Entry deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-special-600" />
      </div>
    );
  }

  const renderEntries = (entriesToRender: LogEntry[]) => (
    entriesToRender.length === 0 ? (
      <Card>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">No entries found.</p>
          <Button className="mt-4" onClick={() => setShowNewEntry(true)}>
            Create an entry
          </Button>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteEntry(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
        <Button onClick={() => setShowNewEntry(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
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
      {showNewEntry && (
        <Card className="border-special-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              New Journal Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setNewEntry({...newEntry, category: category.id})}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 text-sm ${
                          newEntry.category === category.id
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
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Mood</label>
                <div className="flex gap-2">
                  {Object.entries(moodIcons).map(([mood, info]) => {
                    const Icon = info.icon;
                    return (
                      <button
                        key={mood}
                        onClick={() => setNewEntry({...newEntry, mood: mood as any})}
                        className={`p-3 rounded-lg border-2 flex-1 transition-all ${
                          newEntry.mood === mood
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
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Details</label>
              <Textarea
                placeholder="Provide more details about the event, behavior, or observation..."
                value={newEntry.description}
                onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <div className="flex gap-2">
                {[
                  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
                  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                  { value: 'high', label: 'Important', color: 'bg-red-100 text-red-700' }
                ].map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => setNewEntry({...newEntry, priority: priority.value as any})}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      newEntry.priority === priority.value
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
              <Button onClick={handleAddEntry} disabled={!newEntry.title.trim() || !newEntry.category}>
                Add Entry
              </Button>
              <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                Cancel
              </Button>
            </div>
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
    </div>
  );
};

export default DailyLog;
