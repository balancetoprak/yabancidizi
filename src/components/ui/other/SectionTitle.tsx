import { colors, ColorType } from "@/types/component";
import { cn } from "@/utils/helpers";
import { tv } from "tailwind-variants";

export interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: ColorType;
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  classNames?: {
    container?: string;
    indicator?: string;
    title?: string;
  };
}

const title = tv({
  base: "font-bold text-center w-fit mx-auto",
  variants: {
    size: {
      h1: "text-4xl md:text-5xl",
      h2: "text-3xl md:text-4xl",
      h3: "text-2xl md:text-3xl",
      h4: "text-xl md:text-2xl",
      h5: "text-lg md:text-xl",
      h6: "text-base md:text-lg",
    },
  },
  defaultVariants: {
    size: "h5",
  },
});

const indicator = tv({
  base: "rounded-full",
  variants: {
    size: {
      h1: "h-1.5 w-20",
      h2: "h-1.5 w-20",
      h3: "h-1.5 w-16",
      h4: "h-1.5 w-14",
      h5: "h-1.5 w-12",
      h6: "h-1 w-10",
    },
  },
  defaultVariants: {
    size: "h5",
  },
});

const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  color = "primary",
  size,
  className,
  classNames,
  ...props
}) => {
  return (
    <div className={cn("flex w-fit flex-col gap-1", classNames?.container, className)} {...props}>
      <h1 className={cn(title({ size }), classNames?.title)}>{children}</h1>
      <div className={cn(indicator({ size }), colors({ color }), classNames?.indicator)} />
    </div>
  );
};

export default SectionTitle;
