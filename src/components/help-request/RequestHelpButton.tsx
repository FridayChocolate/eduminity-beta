import { useState } from "react";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestHelpDialog } from "./RequestHelpDialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface RequestHelpButtonProps {
  contributorName: string;
  contributorId: string;
  prefilledTopic?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RequestHelpButton({
  contributorName,
  contributorId,
  prefilledTopic = "",
  variant = "default",
  size = "default",
  className = "",
}: RequestHelpButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!user) {
      toast.info("Please login to request help");
      navigate("/auth");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Request Help
      </Button>

      <RequestHelpDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contributorName={contributorName}
        contributorId={contributorId}
        prefilledTopic={prefilledTopic}
      />
    </>
  );
}
