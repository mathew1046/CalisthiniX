import { useState } from "react";
import { useJournal } from "@/hooks/useJournal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Loader2, Plus, Calendar as CalendarIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Journal() {
  const { entries, isLoading, error, createEntry } = useJournal();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [energy, setEnergy] = useState([5]);
  const [mood, setMood] = useState([5]);
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("date", date.toISOString());
      formData.append("energyLevel", energy[0].toString());
      formData.append("mood", mood[0].toString());
      formData.append("notes", notes);
      if (photo) {
        formData.append("photo", photo);
      }

      await createEntry.mutateAsync(formData);
      
      toast({ title: "Entry added", description: "Your journal entry has been saved." });
      setNotes("");
      setPhoto(null);
      setPreviewUrl(null);
      setEnergy([5]);
      setMood([5]);
      setDate(new Date());
    } catch (err) {
      toast({ title: "Error", description: "Failed to save entry", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
  if (error) return <div className="p-8 text-red-500">Error loading journal</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 p-4">
      <h1 className="text-3xl font-heading font-bold uppercase tracking-wide">
        Daily <span className="text-primary">Journal</span>
      </h1>

      {/* Add Entry Form */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-heading">New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/50 border-border/50 hover:bg-white/5",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card/95 backdrop-blur-lg border-border/50">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Energy Level ({energy[0]}/10)</Label>
                <Slider 
                  value={energy} 
                  onValueChange={setEnergy} 
                  min={1} 
                  max={10} 
                  step={1}
                  className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Mood ({mood[0]}/10)</Label>
                <Slider 
                  value={mood} 
                  onValueChange={setMood} 
                  min={1} 
                  max={10} 
                  step={1}
                  className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
              <Textarea 
                placeholder="How was your workout? How do you feel?" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="bg-background/50 border-border/50 min-h-[100px] focus:border-primary/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Photo (Optional)</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="cursor-pointer bg-background/50 border-border/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:font-medium hover:file:bg-primary/20"
                />
                {previewUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-primary/30 flex-shrink-0 shadow-[0_0_10px_rgba(133,255,0,0.1)]">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-primary text-primary-foreground font-bold uppercase tracking-wide shadow-[0_0_15px_rgba(133,255,0,0.2)] hover:shadow-[0_0_20px_rgba(133,255,0,0.4)] transition-all"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold uppercase tracking-wide">Previous Entries</h2>
        {entries?.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-xl bg-card/30 backdrop-blur-sm">
            <p className="text-muted-foreground">No entries yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Start tracking your progress above!</p>
          </div>
        )}
        {entries?.map((entry) => (
          <Card key={entry.id} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {entry.photoUrl && (
                  <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border/30">
                    <img src={entry.photoUrl} alt="Journal" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="text-sm text-muted-foreground font-medium">
                      {format(new Date(entry.date), "PPP p")}
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2.5 py-1 bg-primary/15 text-primary rounded-full border border-primary/20 font-medium">
                        ⚡ Energy: {entry.energyLevel}
                      </span>
                      <span className="px-2.5 py-1 bg-primary/15 text-primary rounded-full border border-primary/20 font-medium">
                        😊 Mood: {entry.mood}
                      </span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{entry.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
