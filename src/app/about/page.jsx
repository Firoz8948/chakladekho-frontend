import { AboutHero, OurStory, TeamSection } from "@/pages-components/about";
import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "ChaklaDekho makes kitchen essentials for every home — chakla, tawa, belan, serving spoons, spatulas, and mortar & pestle. Shop online across India.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <TeamSection />
    </>
  );
}
