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
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Journal() {
  const { entries, isLoading, error, createEntry } = useJournal();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [energy, setEnergy] = useState([5]);
  const [mood, setMood] = useState([5]);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createEntry.mutateAsync({
        energyLevel: energy[0],
        mood: mood[0],
        notes,
        photoUrl: photoUrl || null,
        date: new Date(),
      });
      toast({ title: "Entry added", description: "Your journal entry has been saved." });
      setNotes("");
      setPhotoUrl("");
      setEnergy([5]);
      setMood([5]);
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
      <h1 className="text-3xl font-heading font-bold uppercase">Daily Journal</h1>

      {/* Add Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Energy Level ({energy[0]}/10)</Label>
                <Slider value={energy} onValueChange={setEnergy} min={1} max={10} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Mood ({mood[0]}/10)</Label>
                <Slider value={mood} onValueChange={setMood} min={1} max={10} step={1} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                placeholder="How was your workout? How do you feel?" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label>Photo URL (Optional)</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://..." 
                  value={photoUrl} 
                  onChange={(e) => setPhotoUrl(e.target.value)} 
                />
                {photoUrl && (
                  <div className="w-10 h-10 rounded overflow-hidden border">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Previous Entries</h2>
        {entries?.length === 0 && <p className="text-muted-foreground">No entries yet.</p>}
        {entries?.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {entry.photoUrl && (
                  <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img src={entry.photoUrl} alt="Journal" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.date), "PPP p")}
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">Energy: {entry.energyLevel}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">Mood: {entry.mood}</span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{entry.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
