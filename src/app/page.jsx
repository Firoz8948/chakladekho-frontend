import MarqueeBanner from "@/pages-components/home/MarqueeBanner";

import {
  CategorySection,
  FaqSection,
  FeaturedProducts,
  HeroSection,
  MobileCategoryShowcase,
  ShopCollectionBanner,
  Testimonials,
  VideoProducts,
  WhyChooseUs,
} from "@/pages-components/home";
import { fetchBanners } from "@/utils/homeData";
import { pageMetadata } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Kitchen Essentials — Chakla, Tawa, Belan & More",
  description:
    "ChaklaDekho — shop chakla, tawa, belan, serving spoons, spatulas, and mortar & pestle. Quality kitchen essentials with free shipping across India.",
  path: "/",
});

export default async function HomePage() {
  const [desktopSlides, mobileSlides] = await Promise.all([
    fetchBanners("desktop"),
    fetchBanners("mobile"),
  ]);

  const desktopLcp = desktopSlides[0]?.image;
  const mobileLcp = mobileSlides[0]?.image;

  return (
    <>
      {desktopLcp ? (
        <link
          rel="preload"
          as="image"
          href={desktopLcp}
          media="(min-width: 861px)"
          fetchPriority="high"
        />
      ) : null}
      {mobileLcp ? (
        <link
          rel="preload"
          as="image"
          href={mobileLcp}
          media="(max-width: 860px)"
          fetchPriority="high"
        />
      ) : null}

      <HeroSection
        initialDesktop={desktopSlides}
        initialMobile={mobileSlides}
      />
      <MarqueeBanner />
      <CategorySection />
      <FeaturedProducts />
      <ShopCollectionBanner />
      <MobileCategoryShowcase />
      <WhyChooseUs />
      <VideoProducts />
      <Testimonials />
      <FaqSection />
    </>
  );
}
