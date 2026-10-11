import ShippingReturns from "@/pages-components/policies/ShippingReturns";
import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Shipping & Returns",
  description:
    "Free shipping across India on prepaid and COD orders. ChaklaDekho delivery timelines, returns eligibility, and refund policy.",
  path: "/shipping-returns",
});

export default function ShippingReturnsPage() {
  return <ShippingReturns />;
}
