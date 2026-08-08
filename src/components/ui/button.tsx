import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer liquid-press focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:rounded-t-[inherit] before:bg-linear-to-b before:from-white/25 before:to-transparent",
  {
    variants: {
      variant: {
        default:
          "bg-primary/85 text-primary-foreground shadow-lift backdrop-blur-md backdrop-saturate-150 hover:bg-primary/95",
        destructive:
          "bg-destructive/85 text-destructive-foreground shadow-sm backdrop-blur-md backdrop-saturate-150 hover:bg-destructive/95",
        outline:
          "glass-field glass-refract border hover:bg-accent/60 hover:text-accent-foreground",
        secondary:
          "glass-field glass-refract border text-secondary-foreground hover:bg-secondary/60",
        ghost: "before:hidden hover:glass-field hover:border hover:text-accent-foreground",
        link: "before:hidden text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
