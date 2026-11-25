import { supabase } from "@/integrations/supabase/client";

export type ProfileAssetFolder = "avatars" | "banners" | "proofs";

export async function uploadProfileAsset(
  userId: string,
  folder: ProfileAssetFolder,
  file: File
): Promise<string> {
  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    throw new Error("File exceeds 5MB limit. Please choose a smaller image.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, or PDF files are supported.");
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("study_materials")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message || "Upload failed");
  }

  const { data } = supabase.storage.from("study_materials").getPublicUrl(path);
  return data.publicUrl;
}