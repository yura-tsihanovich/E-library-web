import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NoImg from "../../../../../assets/images/NoImagePlaceholder.jpg";
import { useTranslation } from "react-i18next";
import styles from "./PageBooksList.module.scss";

interface Author {
  name: string;
}

interface Book {
  id: number;
  title: string;
  bookCover: {
    link: string;
  };
  author: Author[];
}

interface PageBooksListProps {
  title: string;
  seeAllLink?: any;
  books?: Book[];
  titleImage?: ReactNode | null;
  getBook: (id: number) => void;
}

const PageBooksList = ({
  title,
  titleImage,
  books,
  seeAllLink,
  getBook,
}: PageBooksListProps) => {
  const { t } = useTranslation();
  const [displayCount, setDisplayCount] = useState<number>(
    books ? books.length : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setDisplayCount(window.innerWidth <= 578 ? 2 : books?.length || 0);
    };

    handleResize(); // Set initial count based on current width
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [books]);

  return (
    <div className={styles.rowNewBooks}>
      <div className={styles.homeTitle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>{title}</h2>
          {titleImage}
        </div>
        <Link className={styles.titleLink} to={seeAllLink}>
          {t("seeAll")}
        </Link>
      </div>
      <div className={styles.newBooksList}>
        {books &&
          books.slice(0, displayCount).map((book) => (
            <div key={book.id} className={styles.newBook}>
              <Link to={`/book/${book.id}`}>
                <div className={styles.imgWrap}>
                  {book.bookCover?.link ? (
                    <img
                      src={book.bookCover.link}
                      alt={book.title}
                      className={styles.bookCoverImage}
                    />
                  ) : (
                    <img
                      src={NoImg}
                      alt={book.title}
                      className={styles.bookCoverImage}
                    />
                  )}
                </div>
              </Link>
              <div className={styles.newBookTitle}>{book.title}</div>
              <div className={styles.newBookAuthor}>
                {book.author.map((author) => author.name).join(", ")}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PageBooksList;
