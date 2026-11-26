import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Move,
  ZoomIn,
  Check,
  X,
  RotateCcw,
  Loader2,
  Camera,
} from "lucide-react";

interface InteractiveCoverBannerProps {
  customBannerUrl: string | null;
  presetClassName: string;
  posX?: number;
  posY?: number;
  zoom?: number;
  heightClass?: string;
  editable?: boolean;
  canUploadCustom?: boolean;
  uploading?: boolean;
  autoRepositionTrigger?: number;
  onUploadFile?: (file: File) => void;
  onSaveFraming?: (framing: {
    posX: number;
    posY: number;
    zoom: number;
  }) => Promise<void>;
  topRightSlot?: React.ReactNode;
}

export function InteractiveCoverBanner({
  customBannerUrl,
  presetClassName,
  posX = 50,
  posY = 35,
  zoom = 1,
  heightClass = "h-44 sm:h-56",
  editable = false,
  canUploadCustom = false,
  uploading = false,
  autoRepositionTrigger = 0,
  onUploadFile,
  onSaveFraming,
  topRightSlot,
}: InteractiveCoverBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draftX, setDraftX] = useState(posX);
  const [draftY, setDraftY] = useState(posY);
  const [draftZoom, setDraftZoom] = useState(zoom);

  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    startX: posX,
    startY: posY,
  });

  useEffect(() => {
    setDraftX(posX);
    setDraftY(posY);
    setDraftZoom(zoom);
  }, [posX, posY, zoom, customBannerUrl]);

  // Automatically enter drag-to-reposition mode right after a new cover is uploaded
  useEffect(() => {
    if (autoRepositionTrigger > 0 && editable && customBannerUrl) {
      setIsRepositioning(true);
    }
  }, [autoRepositionTrigger, editable, customBannerUrl]);

  const clamp = (val: number, min: number, max: number) =>
    Math.min(max, Math.max(min, val));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRepositioning || !customBannerUrl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: draftX,
      startY: draftY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isRepositioning || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;

    const sensitivity = 100 / Math.max(draftZoom, 1);
    const nextX = clamp(
      Math.round(dragStartRef.current.startX - (deltaX / rect.width) * sensitivity),
      0,
      100
    );
    const nextY = clamp(
      Math.round(dragStartRef.current.startY - (deltaY / rect.height) * sensitivity),
      0,
      100
    );

    setDraftX(nextX);
    setDraftY(nextY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if capture already released
    }
  };

  const handleSave = async () => {
    if (!onSaveFraming) {
      setIsRepositioning(false);
      return;
    }
    setSaving(true);
    try {
      await onSaveFraming({
        posX: draftX,
        posY: draftY,
        zoom: Number(draftZoom.toFixed(2)),
      });
      setIsRepositioning(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftX(posX);
    setDraftY(posY);
    setDraftZoom(zoom);
    setIsRepositioning(false);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`${heightClass} w-full relative overflow-hidden select-none transition-colors duration-500 ${
        !customBannerUrl ? presetClassName : "bg-slate-950"
      } ${
        isRepositioning
          ? isDragging
            ? "cursor-grabbing touch-none ring-2 ring-teal-400"
            : "cursor-grab touch-none ring-2 ring-teal-400/70"
          : ""
      }`}
    >
      {/* Hidden Direct Cover Upload Input */}
      {editable && canUploadCustom && onUploadFile && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUploadFile(file);
            e.target.value = "";
          }}
        />
      )}

      {/* Custom Cover Image with Live Pan & Zoom */}
      {customBannerUrl && (
        <img
          src={customBannerUrl}
          alt="Profile cover banner"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-transform duration-75"
          style={{
            objectPosition: `${draftX}% ${draftY}%`,
            transform: `scale(${draftZoom})`,
            transformOrigin: `${draftX}% ${draftY}%`,
          }}
        />
      )}

      {/* Subtle Bottom Gradient */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity ${
          isRepositioning
            ? "bg-black/15"
            : "bg-gradient-to-t from-card via-card/25 to-transparent"
        }`}
      />

      {/* FACEBOOK-STYLE REPOSITION TOOLBAR */}
      {isRepositioning ? (
        <>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 px-3 py-2 text-white shadow-xl"
          >
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 min-w-[170px] sm:min-w-[220px]">
              <ZoomIn className="h-4 w-4 text-teal-400 shrink-0" />
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.05}
                value={draftZoom}
                onChange={(e) => setDraftZoom(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-gray-300 w-9 text-right">
                {draftZoom.toFixed(1)}x
              </span>
            </div>

            {/* Reset / Cancel / Save Buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraftX(50);
                  setDraftY(35);
                  setDraftZoom(1);
                }}
                className="h-7 px-2 text-xs text-gray-300 hover:text-white"
                title="Reset position"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={saving}
                onClick={handleCancel}
                className="h-7 px-2.5 text-xs text-gray-200 hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={handleSave}
                className="h-7 px-3 text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Save Cover
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Center Drag Hint Pill */}
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              isDragging ? "opacity-25" : "opacity-95"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
              <Move className="h-3.5 w-3.5 text-teal-400" />
              Drag to reposition cover
            </div>
          </div>
        </>
      ) : (
        /* NORMAL VIEW CONTROLS */
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-3.5 right-3.5 z-10 flex flex-wrap items-center justify-end gap-2"
        >
          {editable && customBannerUrl && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setIsRepositioning(true)}
              className="h-7 px-2.5 text-xs bg-black/65 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md"
            >
              <Move className="h-3.5 w-3.5 mr-1 text-teal-400" />
              Reposition
            </Button>
          )}

          {editable && canUploadCustom && onUploadFile && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2.5 text-xs bg-black/65 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5 mr-1 text-purple-300" />
                  {customBannerUrl ? "Change Cover" : "Upload Cover"}
                </>
              )}
            </Button>
          )}

          {topRightSlot}
        </div>
      )}
    </div>
  );
}