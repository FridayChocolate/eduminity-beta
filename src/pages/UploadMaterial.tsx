import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

// Add emails of authorized beta creators here
const AUTHORIZED_CREATORS = [
  "business.neurovane@gmail.com",
];

const UploadMaterial = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return <div className="min-h-screen bg-background pt-24 text-center">Please log in.</div>;
  }

  // THE SECURITY GATE
  if (!AUTHORIZED_CREATORS.includes(user.email || '')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pt-32 text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Creator Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            Marketing Mode is currently locked. Only authorized beta creators can upload materials.
          </p>
          <Button onClick={() => navigate("/app/materials")}>Back to Materials</Button>
        </main>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !subject.trim() || !file) {
      toast({ title: "Missing fields", description: "Title, subject, and a file are required.", variant: "destructive" });
      return;
    }

    const parsedPrice = price.trim() === "" ? null : Number(price);
    if (parsedPrice != null && (!Number.isFinite(parsedPrice) || parsedPrice > 1000)) {
      toast({ title: "Price is too high", description: "The maximum allowed price is ৳1000.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("materials").upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("materials").getPublicUrl(filePath);
    const priceValue = parsedPrice != null && Number.isFinite(parsedPrice) ? parsedPrice : null;

    const { error: insertError } = await supabase.from("study_materials").insert({
      title: title.trim(),
      description: description.trim() || null,
      subject: subject.trim(),
      price: priceValue,
      is_free: priceValue == null || priceValue === 0,
      file_url: publicUrlData.publicUrl,
      user_id: user.id,
    });

    if (insertError) {
      toast({ title: "Could not save", description: insertError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Material uploaded", description: "Your study material is now listed." });
    navigate("/app/materials");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-12 pt-24">
        <Card>
          <CardHeader>
            <CardTitle>Upload study material</CardTitle>
            <CardDescription>Add a file and its details to the study hub.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Physics 101 notes" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this material covers" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Physics" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (৳)</Label>
                  <Input id="price" type="number" min="0" max="1000" step="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 for free" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File upload</Label>
                <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Uploading..." : "Upload material"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/app/materials")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UploadMaterial;