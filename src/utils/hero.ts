import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        // @ts-expect-error
        "secondary-background": "#F4F4F5",
      },
    },
    dark: {
      colors: {
        background: "#0f0f0f",
        // @ts-expect-error
        "secondary-background": "#18181B",
      },
    },
  },
});
