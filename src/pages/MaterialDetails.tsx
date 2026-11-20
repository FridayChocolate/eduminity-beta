import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

type PaymentProviderKey = "bkash" | "nagad" | "rocket";

interface TeamAccount {
  id: string;
  label: string;
  holder: string;
  numbers: Record<PaymentProviderKey, string>;
  blurred?: boolean; // Set to false once you paste the real number
}

const TEAM_ACCOUNTS: TeamAccount[] = [
  {
    id: "team_1",
    label: "Account #1",
    holder: "Primary",
    numbers: {
      bkash: "01850710268",
      nagad: "01850710268",
      rocket: "01850710268",
    },
    blurred: false,
  },
  {
    id: "team_2",
    label: "Account #2",
    holder: "Teammate 2",
    numbers: {
      bkash: "01327893434",
      nagad: "01327893434",
      rocket: "01327893434",
    },
    blurred: false,
  },
  {
    id: "team_3",
    label: "Account #3",
    holder: "Teammate 3",
    numbers: {
      bkash: "01947726610",
      nagad: "01947726610",
      rocket: "01947726610",
    },
    blurred: false,
  },
];

const PAYMENT_PROVIDERS: Record<
  PaymentProviderKey,
  {
    name: string;
    accentBg: string;
    accentBorder: string;
    accentText: string;
    buttonClass: string;
  }
> = {
  bkash: {
    name: "bKash",
    accentBg: "bg-[#E2136E]/10",
    accentBorder: "border-[#E2136E]/40",
    accentText: "text-[#ff4d94]",
    buttonClass: "bg-[#E2136E] hover:bg-[#c91061]",
  },
  nagad: {
    name: "Nagad",
    accentBg: "bg-[#F6921E]/10",
    accentBorder: "border-[#F6921E]/40",
    accentText: "text-[#ffae42]",
    buttonClass: "bg-[#F6921E] hover:bg-[#d97e16] text-black",
  },
  rocket: {
    name: "Rocket",
    accentBg: "bg-[#8C3494]/15",
    accentBorder: "border-[#8C3494]/50",
    accentText: "text-[#d075d9]",
    buttonClass: "bg-[#8C3494] hover:bg-[#752a7c]",
  },
};

export default function MaterialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Preview Image Modal state (supports 1-3 images)
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProviderKey>("bkash");
  const [selectedAccountId, setSelectedAccountId] = useState<string>(TEAM_ACCOUNTS[0].id);
  const [trxId, setTrxId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) loadPageData();
  }, [id]);

  const loadPageData = async () => {
    try {
      const { data: matData, error: matError } = await supabase
        .from("materials" as any)
        .select("*")
        .eq("id", id)
        .single();

      if (matError) throw matError;
      setMaterial(matData);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);

        const { data: purchaseData } = await supabase
          .from("purchases" as any)
          .select("status")
          .eq("user_id", user.id)
          .eq("material_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (purchaseData) {
          setPurchaseStatus((purchaseData as any).status);
        }
      }
    } catch (error: any) {
      console.error("Error loading material:", error.message);
      alert("Material not found.");
      navigate("/app/materials");
    } finally {
      setLoading(false);
    }
  };

  const getPreviewPaths = (): string[] => {
    if (Array.isArray(material?.preview_image_paths) && material.preview_image_paths.length > 0) {
      return material.preview_image_paths;
    }
    if (material?.preview_image_path) {
      return [material.preview_image_path];
    }
    return [];
  };

  // BUTTON 1: SAFE MULTI-IMAGE PREVIEW
  const handlePreview = async () => {
    const paths = getPreviewPaths();
    if (paths.length === 0) {
      alert("No preview images available for this material.");
      return;
    }

    try {
      if (previewUrls.length === 0) {
        const signedResults = await Promise.all(
          paths.map(async (path) => {
            const { data, error } = await supabase.storage
              .from("study_materials")
              .createSignedUrl(path, 300);
            if (error) throw error;
            return data.signedUrl;
          })
        );
        setPreviewUrls(signedResults);
      }
      setShowPreview(true);
    } catch (error: any) {
      console.error("Preview error:", error.message);
      alert("Could not load preview images.");
    }
  };

  // OPEN PAYMENT MODAL
  const handleOpenPayment = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to purchase.");
      navigate("/auth");
      return;
    }
    setShowPaymentModal(true);
  };

  const activeProvider = PAYMENT_PROVIDERS[paymentMethod];
  const activeAccount =
    TEAM_ACCOUNTS.find((acc) => acc.id === selectedAccountId) || TEAM_ACCOUNTS[0];
  const activeNumber = activeAccount.numbers[paymentMethod];

  const handleCopyNumber = async () => {
    if (activeAccount.blurred) return;
    try {
      await navigator.clipboard.writeText(activeNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Could not copy number.");
    }
  };

  // SUBMIT PAYMENT REQUEST
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      alert(`Please enter your ${activeProvider.name} Transaction ID / Reference.`);
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("purchases" as any).insert({
        user_id: user.id,
        material_id: material.id,
        amount: material.price,
        payment_method: `${paymentMethod} (${activeAccount.label})`,
        trx_id: trxId.trim(),
        status: "pending",
      });

      if (error) throw error;

      setPurchaseStatus("pending");
      setShowPaymentModal(false);
      setTrxId("");
      alert("Payment submitted! Awaiting admin verification.");
    } catch (error: any) {
      console.error("Purchase error:", error.message);
      alert(`Failed to submit purchase request: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // BUTTON 3: SECURE DOWNLOAD
  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("study_materials")
        .createSignedUrl(material.file_path, 60);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error: any) {
      console.error("Download error:", error.message);
      alert("Could not download the file.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12121A] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!material) return null;

  const isOwner = currentUserId === material.user_id;
  const isFree = material.price === 0;
  const isApproved = purchaseStatus === "approved";
  const isPending = purchaseStatus === "pending";
  const previewCount = getPreviewPaths().length;

  return (
    <div className="min-h-screen bg-[#12121A] text-white p-4 sm:p-6 md:p-12 font-['Inter'] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6 md:mb-8 relative z-50">
          <button
            onClick={() => navigate("/app/materials")}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ← Back to Marketplace
          </button>
        </div>

        <div className="bg-[#1A1A1F]/80 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Left Column */}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-white/5 border border-white/10 text-xs font-medium px-3 py-1.5 rounded-lg text-gray-300">
                  {material.category}
                </span>
                {material.class_level && (
                  <span className="bg-teal-500/10 border border-teal-500/20 text-xs font-medium px-3 py-1.5 rounded-lg text-teal-300">
                    {material.class_level}
                  </span>
                )}
                {material.page_count && (
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium px-3 py-1.5 rounded-lg text-indigo-300">
                    {material.page_count} Pages
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {material.title}
              </h1>

              <div className="prose prose-invert max-w-none text-gray-300 mb-6 md:mb-8 text-sm sm:text-base">
                <p className="whitespace-pre-wrap leading-relaxed">{material.description}</p>
              </div>
            </div>

            {/* Right Column: Locked Checkout Panel */}
            <div className="w-full md:w-80 bg-[#2A2A32]/50 border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col shrink-0">
              <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-2">
                Price
              </p>
              <p className="text-4xl font-black text-teal-400 mb-6">
                {isFree ? "Free" : `৳${material.price}`}
              </p>

              <div className="flex flex-col gap-3 mb-4">
                <Button
                  onClick={handlePreview}
                  disabled={previewCount === 0}
                  variant="outline"
                  className="w-full border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 h-12 rounded-xl transition-all disabled:opacity-40"
                >
                  {previewCount > 0
                    ? `Preview (${previewCount} ${previewCount === 1 ? "Page" : "Pages"})`
                    : "No Preview Available"}
                </Button>

                {isOwner ? (
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold h-14 rounded-xl transition-all"
                  >
                    Your Upload — Download
                  </Button>
                ) : isFree || isApproved ? (
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-black font-bold h-14 rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.02]"
                  >
                    Download Now
                  </Button>
                ) : isPending ? (
                  <Button
                    disabled
                    className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold h-14 rounded-xl cursor-not-allowed"
                  >
                    Awaiting Admin Approval
                  </Button>
                ) : (
                  <Button
                    onClick={handleOpenPayment}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-14 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02]"
                  >
                    Buy Now
                  </Button>
                )}
              </div>

              <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure digital delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BKASH / NAGAD / ROCKET PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Complete Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Provider Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(Object.keys(PAYMENT_PROVIDERS) as PaymentProviderKey[]).map((key) => {
                const provider = PAYMENT_PROVIDERS[key];
                const isSelected = paymentMethod === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaymentMethod(key)}
                    className={`py-2.5 px-3 rounded-xl font-bold text-sm border transition-all ${
                      isSelected
                        ? `${provider.accentBg} ${provider.accentBorder} ${provider.accentText}`
                        : "bg-[#12121A] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {provider.name}
                  </button>
                );
              })}
            </div>

            {/* 3 Team Account Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Choose Recipient Number
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TEAM_ACCOUNTS.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? "bg-teal-500/15 border-teal-400/60 text-teal-300"
                          : "bg-[#12121A] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div>{acc.label}</div>
                      <div className="text-[10px] opacity-75 truncate">{acc.holder}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Instructions */}
            <div
              className={`${activeProvider.accentBg} border ${activeProvider.accentBorder} rounded-xl p-4 mb-5 space-y-2 text-sm`}
            >
              <p className="text-gray-300">
                1. Send <span className="text-teal-400 font-bold">৳{material.price}</span> via{" "}
                <strong className="text-white">{activeProvider.name} Send Money</strong> to{" "}
                <span className="text-white font-semibold">({activeAccount.label})</span>:
              </p>

              <div className="flex items-center justify-center gap-2 py-1">
                <p
                  className={`text-xl sm:text-2xl font-mono font-bold ${activeProvider.accentText} tracking-wider ${
                    activeAccount.blurred ? "blur-[5px] select-none" : ""
                  }`}
                >
                  {activeNumber}
                </p>
                {!activeAccount.blurred && (
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Copy number"
                  >
                    {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {activeAccount.blurred && (
                <p className="text-[11px] text-amber-300 text-center">
                  Number coming soon — please select Account #1 for now.
                </p>
              )}

              <p className="text-gray-400 text-xs">
                2. Copy the Transaction ID (TrxID) / Reference from your {activeProvider.name} SMS
                and paste it below.
              </p>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  {activeProvider.name} Transaction ID (TrxID) / Reference
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g., 9K7A2B4C1D"
                  className="w-full bg-[#12121A] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 text-gray-400 hover:text-white hover:bg-white/10 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || activeAccount.blurred}
                  className={`flex-1 ${activeProvider.buttonClass} font-bold h-12 rounded-xl disabled:opacity-40`}
                >
                  {submitting ? "Submitting..." : `Confirm ${activeProvider.name}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE MULTI-IMAGE PREVIEW MODAL */}
      {showPreview && previewUrls.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#1A1A1F] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#2A2A32]/50">
              <h3 className="font-bold text-white truncate pr-4">
                Preview ({previewUrls.length} {previewUrls.length === 1 ? "Page" : "Pages"}):{" "}
                {material.title}
              </h3>
              <Button
                onClick={() => setShowPreview(false)}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                Close
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-[#12121A]">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                    Preview Page {idx + 1} of {previewUrls.length}
                  </span>
                  <img
                    src={url}
                    alt={`Preview page ${idx + 1}`}
                    className="max-w-full h-auto rounded-lg border border-white/10 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}