import PrivacyPolicy from "@/pages-components/policies/PrivacyPolicy";
import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Read how ChaklaDekho collects, uses, and protects your personal information when you shop kitchen essentials online.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
