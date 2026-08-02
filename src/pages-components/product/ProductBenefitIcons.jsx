import styles from "./ProductBenefitIcons.module.css";

const CDN_HOST = process.env.NEXT_PUBLIC_BUNNY_CDN_HOST;

const ICON_PATHS = [
  "Icons/toxin%20free.webp",
  "Icons/safe%20cooking.webp",
  "Icons/non%20stick.webp",
  "Icons/tastier%20food.webp",
  "Icons/generations.webp",
];

export default function ProductBenefitIcons() {
  if (!CDN_HOST) return null;

  return (
    <div className={styles.row} aria-hidden>
      {ICON_PATHS.map((path) => {
        const src = `https://${CDN_HOST}/${path}`;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={path} src={src} alt="" className={styles.icon} />
        );
      })}
    </div>
  );
}
