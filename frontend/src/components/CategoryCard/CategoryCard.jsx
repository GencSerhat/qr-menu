import { Link } from "react-router-dom";
import styles from "./CategoryCard.module.css";

/**
 * Props:
 * - title: string (ör. "Yiyecekler")
 * - slug: string (ör. "yiyecekler")
 * - imageUrl: string (kapak görseli)
 */

export default function CategoryCard ({title, slug, imageURL}) {
    return (
        <Link to={`/c/${slug}`} className={styles.card} aria-label={`${title} kategorisine git`}>
            <div className={styles.imageWrap}>
                {/*arka plan görselini css ile de verebilirdik; <img> ile tutuyoruz ki LCP iyi olsun */}
                <img src={imageURL} alt={title} className={styles.image} loading="lazy"/>
                <div className={styles.overlay}/>
                <h3 className={styles.title}>{title}</h3>
                
            </div>
        </Link>
    );
}