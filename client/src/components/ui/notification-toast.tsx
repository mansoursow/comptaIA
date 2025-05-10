import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex items-center",
  {
    variants: {
      variant: {
        success: "bg-success text-white",
        error: "bg-danger text-white",
        info: "bg-accent text-white",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface NotificationToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  onDismiss?: () => void;
}

export function NotificationToast({ 
  message, 
  variant,
  onDismiss 
}: NotificationToastProps) {
  const Icon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case "error":
        return <AlertCircle className="h-5 w-5 mr-2" />;
      default:
        return <Info className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div className={cn(toastVariants({ variant }))}>
      <div className="flex items-center">
        <Icon />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="ml-4 text-white/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
