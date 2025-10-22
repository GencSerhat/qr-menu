import styles from "./ProductCard.module.css";
/**
 * Props:
 * - title: string
 * - price: number
 * - imageUrl: string
 * - description?: string
 */

export default function ({ title, price, imageUrl, description }) {
  return (
    <article className={styles.card} aria-label={`${title} ürün kartı`}>
      <div className={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.priceBadge}>
          <span className={styles.priceText}>
            {Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
              maximumFractionDigits: 0,
            }).format(price)}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.desc}>{description}</p> : null}
      </div>
    </article>
  );
}
