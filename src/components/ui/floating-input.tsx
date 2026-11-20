import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMode } from "@/contexts/ModeContext";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, success, helperText, className, type, ...props }, ref) => {
    const { mode } = useMode();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const isFloating = isFocused || hasValue;
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        <motion.label
          htmlFor={props.id}
          initial={false}
          animate={{
            y: isFloating ? -24 : 0,
            scale: isFloating ? 0.85 : 1,
            x: isFloating ? -4 : 0,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none origin-left",
            "text-muted-foreground transition-colors duration-150",
            isFocused && (mode === "student" ? "text-student-primary" : "text-creator-primary"),
            error && "text-destructive",
            success && "text-green-500"
          )}
        >
          {label}
        </motion.label>

        {/* Input */}
        <Input
          ref={ref}
          type={inputType}
          className={cn(
            "pt-2 transition-all duration-200",
            error && "border-destructive focus-visible:ring-destructive animate-shake",
            success && "border-green-500 focus-visible:ring-green-500",
            isFocused && !error && !success && (
              mode === "student" 
                ? "border-student-primary focus-visible:ring-student-primary" 
                : "border-creator-primary focus-visible:ring-creator-primary"
            ),
            isPassword && "pr-10",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            props.onChange?.(e);
          }}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Success Checkmark */}
        <AnimatePresence>
          {success && !isPassword && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Check className="h-4 w-4 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error/Helper Text */}
        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5"
            >
              {error ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{helperText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

// Success animation component for form submission
export const SuccessCheckmark = ({ show }: { show: boolean }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="flex items-center justify-center"
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-green-500"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.path
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12l5 5L20 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
