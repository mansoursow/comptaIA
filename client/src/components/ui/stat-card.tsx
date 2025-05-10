import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowUp, ArrowDown, AlertCircle, 
  EuroIcon, Receipt, File, Upload, 
  Users, FileText, CheckCircle
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: "euro" | "receipt" | "invoice" | "upload" | "users" | "file" | "check";
  color: "primary" | "secondary" | "accent" | "danger";
  change?: string;
  trend?: "up" | "down" | "warning";
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  change,
  trend,
  subtitle,
  action
}: StatCardProps) {
  // Map color to tailwind classes
  const colorClasses = {
    primary: {
      bg: "bg-primary-light/10",
      text: "text-primary-light",
      trendUp: "text-success",
      trendDown: "text-danger",
      trendWarning: "text-accent"
    },
    secondary: {
      bg: "bg-secondary/10",
      text: "text-secondary",
      trendUp: "text-success",
      trendDown: "text-danger",
      trendWarning: "text-accent"
    },
    accent: {
      bg: "bg-accent/10",
      text: "text-accent",
      trendUp: "text-success",
      trendDown: "text-danger",
      trendWarning: "text-accent"
    },
    danger: {
      bg: "bg-danger/10",
      text: "text-danger",
      trendUp: "text-success",
      trendDown: "text-danger",
      trendWarning: "text-accent"
    }
  };

  // Get the appropriate icon component
  const IconComponent = () => {
    switch (icon) {
      case "euro":
        return <EuroIcon className={colorClasses[color].text} />;
      case "receipt":
        return <Receipt className={colorClasses[color].text} />;
      case "invoice":
        return <File className={colorClasses[color].text} />;
      case "upload":
        return <Upload className={colorClasses[color].text} />;
      case "users":
        return <Users className={colorClasses[color].text} />;
      case "file":
        return <FileText className={colorClasses[color].text} />;
      case "check":
        return <CheckCircle className={colorClasses[color].text} />;
    }
  };

  // Get trend icon
  const TrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3 mr-1" />;
      case "down":
        return <ArrowDown className="h-3 w-3 mr-1" />;
      case "warning":
        return <AlertCircle className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color].bg} p-3 rounded-full`}>
          <IconComponent />
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
      
      {(change || trend) && (
        <div className={`mt-2 text-xs ${colorClasses[color][`trend${trend?.charAt(0).toUpperCase()}${trend?.slice(1)}`]} flex items-center`}>
          <TrendIcon />
          {change}
        </div>
      )}
      
      {subtitle && (
        <div className="mt-2 text-xs text-gray-500">
          {subtitle}
        </div>
      )}
      
      {action && (
        <div className="mt-2">
          <Button 
            variant="link" 
            className="text-xs text-primary p-0 h-auto hover:text-primary-dark"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </Card>
  );
}
