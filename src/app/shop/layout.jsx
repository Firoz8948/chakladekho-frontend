import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Shop Kitchen Essentials",
  description:
    "Browse ChaklaDekho's range — chakla, tawa, belan, serving spoons, spatulas, and mortar & pestle. Quality kitchen tools shipped across India.",
  path: "/shop",
});

export default function ShopLayout({ children }) {
  return children;
}
