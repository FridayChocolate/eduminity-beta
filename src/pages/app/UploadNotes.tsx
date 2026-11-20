import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function UploadNotes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pageCount, setPageCount] = useState("");

  // Subject / Category + Custom option
  const [category, setCategory] = useState("Engineering");
  const [customCategory, setCustomCategory] = useState("");

  // Class / Level + Custom option
  const [classLevel, setClassLevel] = useState("University");
  const [customClassLevel, setCustomClassLevel] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const parsedPages = parseInt(pageCount, 10) || 0;
  const requiredPreviews = parsedPages >= 20 ? 3 : 1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const combined = [...previewImages, ...selected].slice(0, 3); // Hard cap at 3
    if (previewImages.length + selected.length > 3) {
      alert("Maximum 3 preview images allowed. Only the first 3 were kept.");
    }
    setPreviewImages(combined);
  };

  const removePreview = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return alert("You must be logged in to upload.");
    if (!file) return alert("Please select the main study material file.");
    if (parsedPages < 1) return alert("Please enter a valid total page count.");

    const finalCategory =
      category === "Other" ? customCategory.trim() : category;
    const finalClassLevel =
      classLevel === "Other" ? customClassLevel.trim() : classLevel;

    if (!finalCategory) {
      return alert("Please specify your custom subject.");
    }
    if (!finalClassLevel) {
      return alert("Please describe your custom class or level.");
    }

    // MANDATORY PREVIEW ENFORCEMENT
    if (previewImages.length < requiredPreviews) {
      return alert(
        parsedPages >= 20
          ? `Files with 20 or more pages require exactly 3 preview images. You currently have ${previewImages.length}.`
          : "You must upload at least 1 preview image (max 3) before publishing."
      );
    }

    setLoading(true);

    try {
      // 1. Upload main study material
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("study_materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Upload all preview images (1 to 3)
      const uploadedPreviewPaths: string[] = [];
      for (const img of previewImages) {
        const imgExt = img.name.split(".").pop();
        const imgName = `${crypto.randomUUID()}.${imgExt}`;
        const imgPath = `${user.id}/previews/${imgName}`;

        const { error: previewError } = await supabase.storage
          .from("study_materials")
          .upload(imgPath, img);

        if (previewError) throw previewError;
        uploadedPreviewPaths.push(imgPath);
      }

      // 3. Save to Postgres database
      const { error: dbError } = await supabase
        .from("materials" as any)
        .insert({
          title,
          description,
          price: parseFloat(price) || 0,
          page_count: parsedPages,
          category: finalCategory,
          class_level: finalClassLevel,
          file_path: filePath,
          preview_image_path: uploadedPreviewPaths[0], // Backwards compatibility
          preview_image_paths: uploadedPreviewPaths,
          user_id: user.id,
        });

      if (dbError) throw dbError;

      alert("Success! Your material is now live.");
      navigate("/app/my-uploads");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload material.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12121A] text-white p-6 md:p-12 font-['Inter']">
      <div className="max-w-2xl mx-auto bg-[#1A1A1F] border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500"></div>

        <h1 className="text-3xl font-bold mb-2 text-white">Upload Study Material</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Share your premium lecture notes, study guides, or past papers and start earning an 80% commission.
        </p>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Title</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., EEE 101 Midterm Notes"
              className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500 h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</label>
            <Textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What exactly is included in this material? (Be detailed for better sales)"
              className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500 min-h-[120px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Price (BDT)</label>
              <Input
                required
                type="number"
                min="0"
                step="10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 or e.g. 150"
                className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500 h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Total Pages</label>
              <Input
                required
                type="number"
                min="1"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder="e.g., 25"
                className="bg-[#2A2A32] border-transparent text-white focus-visible:ring-1 focus-visible:ring-indigo-500 h-11"
              />
            </div>
          </div>

          {/* Subject / Category + Class / Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Subject / Category
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-11 w-full rounded-md bg-[#2A2A32] border-transparent text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business">Business</option>
                <option value="Medicine">Medicine</option>
                <option value="Arts & Humanities">Arts & Humanities</option>
                <option value="Science">Science</option>
                <option value="Other">Other / Custom</option>
              </select>

              {category === "Other" && (
                <Input
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom subject (e.g., Architecture, Law)"
                  className="bg-[#2A2A32] border border-indigo-500/40 text-white focus-visible:ring-1 focus-visible:ring-indigo-500 h-11 mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Class / Level
              </label>
              <select
                required
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="flex h-11 w-full rounded-md bg-[#2A2A32] border-transparent text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <option value="University">University (Undergrad / Grad)</option>
                <option value="HSC">HSC (Class 11–12)</option>
                <option value="SSC">SSC (Class 9–10)</option>
                <option value="Admission">University Admission</option>
                <option value="Other">Other / Custom</option>
              </select>

              {classLevel === "Other" && (
                <Input
                  required
                  value={customClassLevel}
                  onChange={(e) => setCustomClassLevel(e.target.value)}
                  placeholder="Describe class/level (e.g., BCS, IELTS, Diploma)"
                  className="bg-[#2A2A32] border border-teal-500/40 text-white focus-visible:ring-1 focus-visible:ring-teal-500 h-11 mt-2"
                />
              )}
            </div>
          </div>

          {/* Main File Upload */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Upload Main File (PDF, ZIP, DOCX)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#2A2A32] border-dashed rounded-lg cursor-pointer hover:bg-[#2A2A32]/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-1 text-sm text-gray-400">
                    <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">MAX 50MB</p>
                </div>
                <input required type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {file && <p className="text-sm text-teal-400 mt-2 font-medium">Selected: {file.name}</p>}
          </div>

          {/* Mandatory Preview Images Upload */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Preview Screenshots (Mandatory)
              </label>
              <span className={`text-xs font-semibold ${previewImages.length >= requiredPreviews ? "text-teal-400" : "text-amber-400"}`}>
                {previewImages.length} / {requiredPreviews === 3 ? "3 Required (20+ pages)" : "1–3 Required"}
              </span>
            </div>

            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-[#2A2A32] border-dashed rounded-lg cursor-pointer hover:bg-[#2A2A32]/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center px-4">
                  <p className="mb-1 text-sm text-gray-400">
                    <span className="font-semibold text-teal-400">Click to add preview images</span> (JPEG, PNG, WEBP)
                  </p>
                  <p className="text-xs text-gray-500">
                    {parsedPages >= 20
                      ? "Large file detected (20+ pages): 3 preview screenshots are mandatory."
                      : "Minimum 1, maximum 3 preview screenshots required."}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={previewImages.length >= 3}
                  className="hidden"
                  onChange={handlePreviewChange}
                />
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="space-y-2 mt-3">
                {previewImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#2A2A32]/70 px-3 py-2 rounded-lg text-sm"
                  >
                    <span className="text-indigo-300 truncate pr-4">
                      Page {idx + 1}: {img.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePreview(idx)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || previewImages.length < requiredPreviews}
            className="w-full bg-neon-teal hover:bg-teal-400 text-black font-bold h-12 mt-6 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? "Encrypting and Uploading..."
              : previewImages.length < requiredPreviews
              ? `Add ${requiredPreviews - previewImages.length} More Preview Image(s) to Publish`
              : "Publish Material"}
          </Button>
        </form>
      </div>
    </div>
  );
}