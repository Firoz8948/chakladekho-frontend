import ShippingReturns from "@/pages-components/policies/ShippingReturns";
import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Shipping & Returns",
  description:
    "ChaklaDekho shipping timelines, delivery charges, returns eligibility, and refund policy for orders across India.",
  path: "/shipping-returns",
});

export default function ShippingReturnsPage() {
  return <ShippingReturns />;
}
