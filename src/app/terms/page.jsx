import TermsOfService from "@/pages-components/policies/TermsOfService";
import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Terms and conditions for using ChaklaDekho and purchasing kitchen essentials online across India.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsOfService />;
}
