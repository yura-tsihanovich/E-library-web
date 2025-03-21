import styles from "./TopBooksSlider.module.scss";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC } from "react";
import NoImg from "../../../../../assets/images/NoImagePlaceholder.jpg";
import { Skeleton } from "antd";
import { useTranslation } from "react-i18next";

const topSliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  arrows: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        centerMode: false,
        centerPadding: "0px",
        variableWidth: true,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1.5,
        centerMode: false,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        centerMode: false,
      },
    },
  ],
};

interface Author {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  author: Author[];
  bookCover: {
    link: string;
  };
}

interface TopBooksSlider {
  books: any;
  getBook: (id: number) => void;
  isLoading?: boolean;
}

const TopBooksSlider: FC<TopBooksSlider> = ({ books, getBook, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.rowDesktop}>
      <div className={styles.topBooksList}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={styles.topBook}
                style={{ height: "174px" }}
              >
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
                <div className={styles.backgroundImg}>
                  <Skeleton.Image style={{ width: "100%", height: "119px" }} />
                </div>
              </div>
            ))
          : books?.map((book: Book) => (
              <div key={book.id} className={styles.topBook}>
                <div>
                  <div className={styles.topBookTitle}>{book.title}</div>
                  <div className={styles.topBookAuthor}>
                    {book.author[0]?.name}
                  </div>
                  <div className={styles.backgroundImg}>
                    {book.bookCover?.link ? (
                      <img
                        src={book.bookCover?.link}
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
                </div>
                <div
                  className={styles.sliderBookLink}
                  onClick={() => {
                    getBook(book.id);
                  }}
                >
                  {t("readLink")}
                </div>
              </div>
            ))}
      </div>
      <Slider className={styles.topBooksSlider} {...topSliderSettings}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.sliderItemWrapper}>
                <div className={styles.sliderBook} style={{ height: "174px" }}>
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                  <div className={styles.backgroundImg}>
                    <Skeleton.Image
                      style={{ width: "100%", height: "119px" }}
                    />
                  </div>
                </div>
              </div>
            ))
          : books?.map((book: Book) => (
              <div key={book.id} className={styles.sliderItemWrapper}>
                <div className={styles.sliderBook}>
                  <div>
                    <div className={styles.topBookTitle}>{book.title}</div>
                    <div className={styles.topBookAuthor}>
                      {book.author[0]?.name}
                    </div>
                    <div className={styles.backgroundImg}>
                      <img
                        src={book.bookCover?.link}
                        alt={book.title}
                        className={styles.bookCoverImage}
                      />
                    </div>
                  </div>
                  <div
                    className={styles.sliderBookLink}
                    onClick={() => {
                      getBook(book.id);
                    }}
                  >
                    {t("readLink")}
                  </div>
                </div>
              </div>
            ))}
      </Slider>
    </div>
  );
};

export default TopBooksSlider;
