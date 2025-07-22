import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const textSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text,
  className = "",
  fullScreen = false,
}) => {
  const content = (
    <div
      className={`flex flex-col items-center justify-center w-full ${className}`}
    >
      <Loader2
        className={`animate-spin text-primary mb-2 ${sizeClasses[size]}`}
      />
      {text && (
        <p className={`text-muted-foreground ${textSizes[size]}`}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        {content}
      </div>
    );
  }

  return content;
};
