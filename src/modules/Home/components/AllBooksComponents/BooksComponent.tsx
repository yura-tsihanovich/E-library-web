import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Progress, Skeleton } from "antd";
import styles from "./BooksComponent.module.scss";
import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import BackIcon from "../../../../assets/images/icons/backPage.svg";
import ArrowDown from "../../../../assets/images/icons/arrowProfile.svg";
import { useHistory } from "react-router-dom";
import { useLazySelector } from "../../../../hooks";
import { getBookshelfById } from "../../slices/home";
import { UserContext } from "../../../../core/contexts";
import { useDispatch } from "react-redux";
import { routes } from "../../routing";
import { useTranslation } from "react-i18next";

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
  isBookshelfStarted?: boolean;
  isBookshelfNotStarted?: boolean;
}

type HomeProps = {
  books: any;
  getBook: (id: any) => void;
  title?: any;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hasMoreBooks?: boolean;
};

const BooksComponent: React.FC<HomeProps> = ({
  books,
  getBook,
  title,
  isLoading,
  isLoadingMore,
  onLoadMore,
  hasMoreBooks,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const value = useContext(UserContext);

  const { currentBookshelfBook } = useLazySelector(({ home }) => ({
    currentBookshelfBook: home.currentBookshelfBook,
  }));
  const [bookProgress, setBookProgress] = useState<Record<number, number>>({});
  const processedBooks = useRef<Set<number>>(new Set());
  const dispatch = useDispatch();

  const continueReadingBook = useCallback((id) => {
    history.push(`${routes.reading}/${id}`);
  }, []);

  useEffect(() => {
    if (books && value?.id) {
      books.forEach((book: Book) => {
        if (book.isBookshelfStarted) {
          const bookshelfBook = currentBookshelfBook?.result?.book;

          if (bookshelfBook && bookshelfBook.id === book.id) {
            if (currentBookshelfBook?.result?.progress !== undefined) {
              setBookProgress((prev) => ({
                ...prev,
                [book.id]: currentBookshelfBook.result.progress,
              }));
            }
          } else if (!processedBooks.current.has(book.id)) {
            processedBooks.current.add(book.id);
            dispatch(
              getBookshelfById({
                // @ts-ignore
                userId: +value.id,
                bookId: book.id,
              })
            );
          }
        }
      });
    }
  }, [books, dispatch, value, currentBookshelfBook]);

  return (
    <div className={styles.home_page}>
      <div
        onClick={() => history.goBack()}
        className={commonStyles.backBtnRelativePage}
      >
        <img style={{ marginRight: 9 }} src={BackIcon} alt="Back arrow" />
        {t("backBtn")}
      </div>
      <div className={styles.page_title}>
        {isLoading && !isLoadingMore ? (
          <Skeleton
            active
            style={{ height: 70, width: 100 }}
            title={false}
            paragraph={{ rows: 0 }}
          />
        ) : (
          <h1>{title}</h1>
        )}
      </div>
      <div className={styles.booksList}>
        {isLoading && !isLoadingMore
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.newBook}>
                <div className={styles.imgWrap}>
                  <Skeleton.Image style={{ width: "142px", height: "175px" }} />
                </div>
                <div className={styles.newBookTitle}>
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                </div>
                <div className={styles.newBookAuthor}>
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                </div>
              </div>
            ))
          : books?.map((book: Book) => (
              <div key={book.id}>
                <div
                  className={styles.newBook}
                  onClick={() => getBook(book.id)}
                >
                  <div className={styles.imgWrap}>
                    <img src={book.bookCover?.link} alt={book.title} />
                  </div>
                  <div className={styles.newBookTitle}>{book.title}</div>
                  <div
                    style={{
                      color:
                        book?.isBookshelfNotStarted || book?.isBookshelfStarted
                          ? "grey"
                          : "#996C42",
                    }}
                    className={styles.newBookAuthor}
                  >
                    {book.author.map((author) => author.name).join(", ")}
                  </div>

                  {book?.isBookshelfStarted && (
                    <div
                      className="shelf-progress"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <Progress
                        percent={bookProgress[book.id]}
                        style={{ padding: 0, flex: 1 }}
                        status="active"
                        showInfo={false}
                        strokeColor="#1890ff"
                      />
                      <span
                        style={{
                          marginLeft: "8px",
                          whiteSpace: "nowrap",
                          color: "#996C42",
                        }}
                      >
                        {Math.round(bookProgress[book.id])}%
                      </span>
                    </div>
                  )}
                </div>
                {book?.isBookshelfStarted && (
                  <div
                    onClick={() => continueReadingBook?.(book.id)}
                    className={styles.startBtn}
                  >
                    {t("continueReading")}
                  </div>
                )}
              </div>
            ))}
      </div>
      {hasMoreBooks && (
        <div className={styles.loadMoreBtn} onClick={onLoadMore}>
          {isLoadingMore ? (
            t("loading")
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              {t("loadMoreBtn")}
              <img style={{ marginLeft: 5 }} src={ArrowDown} alt="icon" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BooksComponent;
