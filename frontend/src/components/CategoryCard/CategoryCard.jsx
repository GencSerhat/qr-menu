import { Link } from "react-router-dom";
import styles from "./CategoryCard.module.css";

/**
 * Props:
 * - title: string (ör. "Yiyecekler")
 * - slug: string (ör. "yiyecekler")
 * - imageUrl: string (kapak görseli)
 */

export default function CategoryCard ({title, slug, imageUrl}) {
    const fallback = "https://picsum.photos/800/500?cat";
    return (
        <Link to={`/c/${slug}`} className={styles.card} aria-label={`${title} kategorisine git`}>
            <div className={styles.imageWrap}>
                {/*arka plan görselini css ile de verebilirdik; <img> ile tutuyoruz ki LCP iyi olsun */}
              <img
         src={imageUrl}
          alt={title}
          className={styles.image}
          loading="lazy"
onError={(e) => { e.currentTarget.src = "https://picsum.photos/800/500?cat"; }}
       />
                <div className={styles.overlay}/>
                 <h3 className={styles.title}><span>{title}</span></h3>
                
            </div>
        </Link>
    );
}