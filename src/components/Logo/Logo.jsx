import Image from "next/image";

import { ASSETS, BRAND } from "@/utils/constants";

const LOGO_ASPECT_RATIO = 1368 / 984;

export default function Logo({ width, height, size = 40, className = "", priority = false }) {
  const h = height || size;
  const w = width || Math.round(h * LOGO_ASPECT_RATIO);

  return (
    <Image
      src={ASSETS.logo}
      alt={BRAND.name}
      width={w}
      height={h}
      className={className}
      priority={priority}
    />
  );
}

