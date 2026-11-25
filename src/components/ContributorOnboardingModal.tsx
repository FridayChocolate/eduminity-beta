import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileCheck2,
  Award,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadProfileAsset } from "@/lib/profileMedia";
import confetti from "canvas-confetti";

interface ContributorOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  onCompleted: () => void;
}

export function ContributorOnboardingModal({
  open,
  onClose,
  user,
  onCompleted,
}: ContributorOnboardingModalProps) {
  const { toast } = useToast();
  const meta = user?.user_metadata || {};

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Core Identity & Payouts
  const [fullName, setFullName] = useState(meta.full_name || "");
  const [institution, setInstitution] = useState(meta.institution || "");
  const [department, setDepartment] = useState(meta.department || "");
  const [studentId, setStudentId] = useState(meta.student_id || "");
  const [expertise, setExpertise] = useState(meta.expertise || "");
  const [payoutNumber, setPayoutNumber] = useState(meta.payout_number || "");

  // Step 2: Tangible Academic Proof & Honors
  const [cgpa, setCgpa] = useState(meta.cgpa || "");
  const [honors, setHonors] = useState(meta.honors || "");
  const [bio, setBio] = useState(meta.bio || "");
  const [idCardUrl, setIdCardUrl] = useState<string>(meta.student_id_card_url || "");
  const [meritProofUrl, setMeritProofUrl] = useState<string>(meta.academic_proof_url || "");
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingMerit, setUploadingMerit] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      const m = user.user_metadata;
      setFullName(m.full_name || "");
      setInstitution(m.institution || "");
      setDepartment(m.department || "");
      setStudentId(m.student_id || "");
      setExpertise(m.expertise || "");
      setPayoutNumber(m.payout_number || "");
      setCgpa(m.cgpa || "");
      setHonors(m.honors || "");
      setBio(m.bio || "");
      setIdCardUrl(m.student_id_card_url || "");
      setMeritProofUrl(m.academic_proof_url || "");
      setStep(1);
    }
  }, [user, open]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !institution.trim() ||
      !studentId.trim() ||
      !expertise.trim() ||
      !payoutNumber.trim()
    ) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your name, university, student ID, subjects, and payout number.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleProofUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "id" | "merit"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (kind === "id") setUploadingId(true);
    else setUploadingMerit(true);

    try {
      const url = await uploadProfileAsset(user.id, "proofs", file);
      if (kind === "id") {
        setIdCardUrl(url);
        toast({ title: "University ID uploaded", description: "+50 XP earned!" });
      } else {
        setMeritProofUrl(url);
        toast({ title: "Academic Merit Proof uploaded", description: "+50 XP earned!" });
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Could not upload proof file.",
        variant: "destructive",
      });
    } finally {
      if (kind === "id") setUploadingId(false);
      else setUploadingMerit(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error: roleError } = await (supabase as any)
        .from("user_roles")
        .insert({ user_id: user.id, role: "contributor" });

      if (roleError && !String(roleError.message || "").toLowerCase().includes("duplicate")) {
        throw roleError;
      }

      const updatedMeta = {
        full_name: fullName.trim(),
        institution: institution.trim(),
        department: department.trim(),
        student_id: studentId.trim(),
        expertise: expertise.trim(),
        payout_number: payoutNumber.trim(),
        cgpa: cgpa.trim(),
        honors: honors.trim(),
        bio: bio.trim(),
        student_id_card_url: idCardUrl,
        academic_proof_url: meritProofUrl,
        verification_status: meta.verification_status || "pending",
      };

      const { error: metaError } = await supabase.auth.updateUser({
        data: updatedMeta,
      });

      if (metaError) throw metaError;

      // Sync to public profiles table
      try {
        await (supabase as any).from("profiles").upsert({
          id: user.id,
          full_name: updatedMeta.full_name,
          email: user.email,
          institution: updatedMeta.institution,
          department: updatedMeta.department,
          bio: updatedMeta.bio,
        });
      } catch {
        // Ignore optional column mismatches
      }

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast({
        title: "Creator Dossier Activated!",
        description: "Your credentials and proof vault are live. Welcome to Creator Studio.",
      });

      onCompleted();
    } catch (err: any) {
      toast({
        title: "Setup failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl bg-[#14141C] border-purple-500/35 text-white overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Creator Dossier • Step {step} of 2
            </span>
            <div className="flex gap-1.5">
              <span
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  step >= 1 ? "bg-purple-500" : "bg-white/15"
                }`}
              />
              <span
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  step >= 2 ? "bg-teal-400" : "bg-white/15"
                }`}
              />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-white pt-1">
            {step === 1
              ? "Academic Identity & Payout Setup"
              : "Upload Academic Proof & Merit Vault"}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs sm:text-sm">
            {step === 1
              ? "Verify your student identity and set where your 80% note royalties are sent."
              : "Students buy 3x more from creators with verified ID cards, grade sheets, and honors."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              onSubmit={handleNextStep}
              className="space-y-3.5 mt-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300">Full Legal Name *</Label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sadman Hasan"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300">Student ID Number *</Label>
                  <Input
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 253-33-026"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300">University / College *</Label>
                  <Input
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Daffodil International University"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300">Department / Major</Label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. B.Sc in EEE"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300">Core Subjects *</Label>
                  <Input
                    required
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. Circuit Analysis, Calculus, Physics"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300">bKash / Nagad Number *</Label>
                  <Input
                    required
                    value={payoutNumber}
                    onChange={(e) => setPayoutNumber(e.target.value)}
                    placeholder="e.g. 01XXXXXXXXX"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Next: Proof &amp; Merit Vault
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={handleFinalSubmit}
              className="space-y-3.5 mt-2"
            >
              {/* Two Proof Upload Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. University ID Card Upload */}
                <label className="cursor-pointer rounded-xl border border-dashed border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 p-3.5 transition-colors block">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    disabled={uploadingId}
                    onChange={(e) => handleProofUpload(e, "id")}
                  />
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Student ID Card
                    </span>
                    <span className="text-[10px] font-bold text-teal-400">+50 XP</span>
                  </div>
                  {uploadingId ? (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 py-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading ID...
                    </p>
                  ) : idCardUrl ? (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-2 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> ID Card Attached
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1.5 py-2">
                      <Upload className="h-3.5 w-3.5" /> Upload ID photo (JPG/PNG)
                    </p>
                  )}
                </label>

                {/* 2. Academic Result / Merit Proof Upload */}
                <label className="cursor-pointer rounded-xl border border-dashed border-teal-500/40 bg-teal-500/5 hover:bg-teal-500/10 p-3.5 transition-colors block">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    disabled={uploadingMerit}
                    onChange={(e) => handleProofUpload(e, "merit")}
                  />
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                      <FileCheck2 className="h-4 w-4" />
                      Grade / Merit Proof
                    </span>
                    <span className="text-[10px] font-bold text-teal-400">+50 XP</span>
                  </div>
                  {uploadingMerit ? (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 py-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading proof...
                    </p>
                  ) : meritProofUrl ? (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-2 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Merit Proof Attached
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1.5 py-2">
                      <Upload className="h-3.5 w-3.5" /> Result sheet / Award (JPG/PDF)
                    </p>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300">Current CGPA / GPA</Label>
                  <Input
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 3.88 / 4.00"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    Academic Honors / Rank
                  </Label>
                  <Input
                    value={honors}
                    onChange={(e) => setHonors(e.target.value)}
                    placeholder="e.g. Dean's List, 1st in Batch"
                    className="bg-[#1F1F2B] border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-300">Why should students trust your notes?</Label>
                <Textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Hand-drawn circuit diagrams + solved past 5 semesters of mid & final papers..."
                  className="bg-[#1F1F2B] border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-gray-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back
                </Button>

                <Button
                  type="submit"
                  disabled={saving || uploadingId || uploadingMerit}
                  className="bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-95 text-white font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Launch Creator Studio
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}