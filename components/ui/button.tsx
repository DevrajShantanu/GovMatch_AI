import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary dark:bg-blue-600 text-white shadow-sm hover:bg-primary/90 dark:hover:bg-blue-500 hover:shadow-md",
        ai:
          "bg-ai-gradient text-white shadow-md hover:opacity-95 hover:shadow-lg hover:shadow-primary/25 border border-primary/20",
        secondary:
          "bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-100 hover:bg-surface-container-highest dark:hover:bg-slate-700 border border-outline-variant/40 dark:border-slate-700",
        outline:
          "border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 text-on-surface dark:text-slate-100 hover:bg-surface-container-low dark:hover:bg-slate-800 hover:text-primary dark:hover:text-blue-400 hover:border-primary/50 dark:hover:border-blue-500/50 shadow-2xs",
        ghost:
          "text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800/80 hover:text-primary dark:hover:text-blue-400",
        destructive:
          "bg-rose-600 dark:bg-rose-600 text-white hover:bg-rose-700 dark:hover:bg-rose-500 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-sm font-bold",
        icon: "h-9 w-9 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
