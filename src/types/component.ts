import { PropsWithChildren } from "react";
import { tv } from "tailwind-variants";

export type ColorType = "warning" | "primary" | "secondary" | "success" | "danger";

export const colors = tv({
  variants: {
    color: {
      warning: "bg-warning",
      primary: "bg-primary",
      secondary: "bg-secondary",
      success: "bg-success",
      danger: "bg-danger",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

export type HandlerType = {
  opened: boolean;
  onClose: () => void;
};

export type InputWrapperProps = {
  /** `Input.Label` bileşeninin içeriği. Ayarlanmazsa, etiket görüntülenmez. */
  label?: React.ReactNode;
  /** `Input.Description` bileşeninin içeriği. Ayarlanmazsa, açıklama görüntülenmez. */
  description?: React.ReactNode;
  /** `Input.Error` bileşeninin içeriği. Ayarlanmazsa hata görüntülenmez. */
  error?: React.ReactNode;
  /** Girişe gerekli özniteliği ve etiketin sağ tarafına kırmızı bir yıldız işareti ekler @default `false` */
  required?: boolean;
};

export type DropdownItemProps = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  color?: ColorType;
  className?: string;
};

export type OverlayProps = PropsWithChildren & {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
};
