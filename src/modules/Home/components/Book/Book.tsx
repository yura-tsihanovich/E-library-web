import React, { useContext, useEffect, useState } from "react";
import styles from "./Book.module.scss";
import { UserContext } from "core/contexts";
import Button from "../../../../components/common/Buttons/Button";
import Question from "../../../../assets/images/icons/question.png";
import Download from "../../../../assets/images/icons/download.png";
import Group from "../../../../assets/images/icons/group.png";
import HabitIcon from "../../../../assets/images/icons/habit_icon.png";
import ReviewIcon from "../../../../assets/images/icons/review_icon.png";
import LikeIcon from "../../../../assets/images/icons/like.svg";
import ListenIcon from "../../../../assets/images/icons/listenIcon.svg";
import { useHistory, useParams } from "react-router-dom";
// @ts-ignore
import Rating from "react-rating-stars-component";
import NoImg from "../../../../assets/images/NoImagePlaceholder.jpg";
import LanguageModal from "../../../Auth/components/LanguageModal";
import NoAvatar from "../../../../assets/images/icons/uploadBg.png";
import ReviewModal from "../common/ReviewModal";
import { routes } from "../../routing";
import PageBooksList from "../common/PageBooksList/PageBooksList";
import BackIcon from "../../../../assets/images/icons/backPage.svg";
import Review from "../common/Review/Review";
import { Skeleton } from "antd";
import { useDispatch } from "react-redux";
import { getBookVersion } from "../../slices/home";
import { getLocalization } from "../../../Auth/slices/auth";
import { useTranslation } from "react-i18next";

type LanguageType = {
  id: number;
  name: string;
  flag: {
    link: string;
  };
};

type UserType = {
  userName: string;
  id: string;
};

type ReviewType = {
  id?: number;
  rating: number;
  text: string;
  reviewer: string;
  deleteReview: any;
  user?: UserType;
};

type CategoryType = {
  id: number;
  name: string;
  color: string;
};

export type BookType = {
  id: any;
  title: string;
  added: number;
  isFavourite: boolean;
  author: { name: string }[];
  description: string;
  bookCover: { link: string };
  isAgeRestricted: boolean;
  categories: CategoryType[];
  rating: number;
  reviewCount: number;
};

type BookProps = {
  languages: LanguageType[];
  reviews?: ReviewType[]; // Mark reviews as optional
  currentBook: { result: BookType | null };
  getBook: (id: number) => void;
  addToBookShelf: any;
  deleteFromBookShelf: any;
  reviewSubmit: any;
  similarBooks: any;
  deleteReview: any;
  getAuthorBooks: any;
  startRead: any;
  startListen: any;
  currentBookVersion: any;
};

const Book: React.FC<BookProps> = ({
  languages,
  reviews = [],
  currentBook,
  getBook,
  addToBookShelf,
  deleteFromBookShelf,
  reviewSubmit,
  similarBooks,
  deleteReview,
  getAuthorBooks,
  startRead,
  currentBookVersion,
  startListen,
}) => {
  const { t } = useTranslation();
  const [book, setBook] = useState<BookType | null>(null);
  const { id } = useParams<{ id: string }>();
  const value = useContext(UserContext);
  const history = useHistory();

  const defaultLanguage = (languages || []).find(
    (lang) => lang.name === "English"
  ) || {
    id: 7,
    name: "Select Language",
    flag: { link: NoAvatar },
    translationType: "official",
  };

  const [selectedLanguage, setSelectedLanguage] = useState(
    value?.bookLanguage || defaultLanguage
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  useEffect(() => {
    if (id) {
      getBook(Number(id));
    }
  }, [id, getBook]);

  useEffect(() => {
    // Изначально выбираем язык из value?.bookLanguage, если он есть
    if (value?.bookLanguage) {
      setSelectedLanguage(value.bookLanguage);
    } else {
      // Если нет, используем дефолтный язык
      setSelectedLanguage(defaultLanguage);
    }
  }, [value?.bookLanguage]);

  useEffect(() => {
    if (selectedLanguage && currentBook?.result?.id) {
      dispatch(
        getBookVersion({
          page: "1",
          limit: "1",
          filterLanguage: `[language.id][eq]=${selectedLanguage?.id}`,
          filterId: `[coreBook.id][eq]=${currentBook?.result?.id}`,
        })
      );
    }
  }, [selectedLanguage, currentBook?.result?.id, dispatch]);

  useEffect(() => {
    if (currentBookVersion?.result) {
      setBook(currentBookVersion.result);
    }
  }, [currentBookVersion?.result]);

  useEffect(() => {
    if (currentBook?.result) {
      setBook(currentBook.result);
      setIsLiked(currentBook.result.isFavourite);
    }
  }, [currentBook, currentBookVersion?.result]);

  const handleLikeClick = () => {
    if (book) {
      if (isLiked) {
        // If already liked, remove from bookshelf
        deleteFromBookShelf({
          userId: value.id,
          bookId: book.id,
        });
      } else {
        // If not liked, add to bookshelf
        addToBookShelf({
          user: {
            id: value.id,
          },
          book: {
            id: book.id,
          },
          isFavourited: true,
          readingState: "added",
        });
      }
      setIsLiked(!isLiked);
    }
  };

  const onLanguageSelect = (language: LanguageType) => {
    setSelectedLanguage(language);
    sessionStorage.setItem("currentBookLanguage", JSON.stringify(language));
  };

  useEffect(() => {
    if (currentBook?.result) {
      setBook(currentBook.result);
    }
  }, [currentBook]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  // useEffect(() => {
  //   if (languages && languages.length > 0) {
  //     const englishLanguage = languages.find((lang) => lang.name === "English");
  //     if (englishLanguage) {
  //       setSelectedLanguage(englishLanguage);
  //     }
  //   }
  // }, [languages]);

  const formatFileSize = (bytesStr: string): string => {
    const bytesNum = Number(bytesStr);
    if (isNaN(bytesNum) || bytesNum <= 0) {
      return "Введите корректное число";
    }

    const sizes = ["bytes", "KB", "MB"];
    let value = bytesNum;
    let index = 0;

    while (value >= 1024 && index < sizes.length - 1) {
      value /= 1024;
      index++;
    }

    return `${value.toFixed(2)} ${sizes[index]}`;
  };

  if (
    (!languages.length && currentBook) ||
    currentBookVersion.isLoading ||
    !currentBook?.result?.id
  ) {
    return (
      <div className={styles.home_page}>
        <div className={styles.home_page}>
          <div className={styles.flex_wrap}>
            <div className={styles.left_side}>
              <Skeleton.Image
                style={{
                  width: "247px",
                  height: "372px",
                  marginBottom: "20px",
                }}
              />
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            </div>
            <div className={styles.right_side}>
              <div style={{ marginBottom: "20px" }}>
                <Skeleton.Button active />
              </div>
              <div style={{ marginBottom: "40px", width: "300px" }}>
                <Skeleton.Button active block />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Skeleton.Button
                  style={{ marginBottom: "20px", width: "95%", height: "54px" }}
                  active
                  block
                />
                <Skeleton.Button
                  style={{ marginBottom: "20px", width: "95%", height: "54px" }}
                  active
                  block
                />
              </div>
              <Skeleton.Button style={{ marginBottom: "20px" }} active block />
              <Skeleton.Button
                style={{ marginBottom: "20px", height: "80px" }}
                active
                block
              />
              <Skeleton.Button
                style={{ marginBottom: "20px", height: "60px" }}
                active
                block
              />
              <Skeleton.Button
                style={{ marginBottom: "20px", height: "60px" }}
                active
                block
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => history.goBack()}
        className={styles.backBtnRelativePage}
      >
        <img style={{ marginRight: 9 }} src={BackIcon} alt="Back arrow" />
        {t("backBtn")}
      </div>
      <div className={styles.home_page}>
        <div className={styles.flex_wrap}>
          <div className={styles.left_side}>
            <div className={styles.img_wrap}>
              {currentBookVersion?.result?.data[0]?.locBookCover?.link ? (
                <img
                  src={currentBookVersion?.result?.data[0]?.locBookCover?.link}
                  alt={"img"}
                  className={styles.bookCoverImage}
                />
              ) : (
                <img
                  src={NoImg}
                  alt={book?.title}
                  className={styles.bookCoverImage}
                />
              )}
            </div>
            <div className={styles.desktopView}>
              {book?.isAgeRestricted && (
                <div className={styles.age_row}>
                  <img style={{ marginRight: "5px" }} src={Group} alt="icon" />
                  For Ages 16 and Up
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: "16px",
                }}
              >
                {book?.categories?.map((category: any) => (
                  <div
                    key={category.id}
                    style={{ background: category.color }}
                    className={styles.habit_tag}
                  >
                    <img
                      style={{ marginRight: "5px" }}
                      src={HabitIcon}
                      alt="icon"
                    />
                    {category?.name
                      ? t(`category${category.name}`, {
                          defaultValue: category?.name || t("categoryNotFound"),
                        })
                      : t("categoryNotFound")}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.right_side}>
            <div className={styles.top_block}>
              <div className={styles.book_title}>
                <div>{currentBookVersion?.result?.data[0]?.title}</div>
                <div className={styles.bookSettings}>
                  <div className={styles.desktopView}>
                    <div
                      onMouseDown={(e) => {
                        e.preventDefault();
                        showModal();
                      }}
                      className={styles.languageSelectWrapper}
                    >
                      <div
                        className={styles.languageSelect}
                        style={{
                          backgroundImage: `url(${selectedLanguage.flag.link})`,
                        }}
                      ></div>
                      <span>{selectedLanguage.name}</span>
                      {currentBookVersion?.result?.data[0]?.translationType !==
                        "official" && <div className={styles.aiMarker}>AI</div>}
                    </div>
                  </div>
                  <div
                    className={styles.bookShelfButton}
                    onClick={handleLikeClick}
                  >
                    <img
                      src={LikeIcon}
                      alt="like"
                      className={isLiked ? styles.likedIcon : ""}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className={styles.author_title}
              style={{ marginBottom: "28px" }}
            >
              {book?.author?.map((author: any, index: number) => {
                const isLast = index === book.author.length - 1;
                const isSecondLast = index === book.author.length - 2;
                return (
                  <React.Fragment key={index}>
                    <span
                      className={styles.author}
                      onClick={() => getAuthorBooks(author.id)}
                      style={{
                        cursor: "pointer",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      {author.name}
                    </span>
                    {isSecondLast && (
                      <span style={{ color: "#7C7A72" }}> and </span>
                    )}
                    {!isSecondLast && !isLast && ", "}
                  </React.Fragment>
                );
              })}
            </div>
            <div className={styles.mobileView}>
              <div style={{ display: "flex" }}>
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    showModal();
                  }}
                  className={styles.languageSelectWrapper}
                >
                  <div
                    className={styles.languageSelect}
                    style={{
                      backgroundImage: `url(${selectedLanguage.flag.link})`,
                    }}
                  ></div>
                  <span>{selectedLanguage.name}</span>
                </div>
              </div>
            </div>
            <Button
              className={styles.readBtn}
              style={{ marginTop: "30px" }}
              onClick={() => {
                startRead({ bookId: id });
              }}
              variant="Brown"
              type="submit"
            >
              {t("readNowBtn")}
            </Button>
            <div className={styles.btns_block}>
              <Button
                style={{
                  color: "#996C42",
                  border: "2px solid rgba(153, 108, 66, 0.2)",
                  borderRadius: "50px",
                  background: "transparent",
                  marginTop: "0",
                }}
                onClick={() => {
                  startListen({ bookId: id });
                }}
                icon={<img src={ListenIcon} alt="icon" />}
              >
                {t("listen")}
              </Button>
              <div className={styles.divider} />
              <Button
                className={styles.questionBtn}
                to={`${routes.askQuestion}/${id}`}
                style={{
                  color: "#996C42",
                  border: "2px solid rgba(153, 108, 66, 0.2)",
                  borderRadius: "50px",
                  background: "transparent",
                }}
                variant="Transparent"
                icon={<img src={Question} alt="icon" />}
              >
                {t("AskQuestionBtn")}
              </Button>
            </div>
            <section className={styles.bookDescription}>
              <div className={styles.description}>
                <div className={styles.section_title}>
                  {t("bookDescriptionBtn")}
                </div>
                <p>
                  <div>{currentBookVersion?.result?.data[0]?.description}</div>
                </p>
              </div>
              <div className={styles.mobileView}>
                <div className={styles.age_row}>
                  <img style={{ marginRight: "5px" }} src={Group} alt="icon" />
                  {t("ageLimit")}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "left",
                    justifyContent: "left",
                    paddingTop: "16px",
                    paddingBottom: "16px",
                  }}
                >
                  {book?.categories?.map((category: any) => (
                    <div
                      key={category.id}
                      style={{ background: category.color }}
                      className={styles.habit_tag}
                    >
                      <img
                        style={{ marginRight: "5px" }}
                        src={HabitIcon}
                        alt="icon"
                      />
                      {category?.name
                        ? t(`category${category.name}`, {
                            defaultValue:
                              category?.name || t("categoryNotFound"),
                          })
                        : t("categoryNotFound")}
                    </div>
                  ))}
                </div>
              </div>
              {currentBookVersion?.result?.data[0]?.bookFile?.link && (
                <a
                  href={currentBookVersion?.result?.data[0]?.bookFile?.link}
                  download
                  rel="noopener noreferrer"
                  className={styles.downloadLink}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#996C42",
                    border: "2px solid rgba(153, 108, 66, 0.2)",
                    background: "transparent",
                    borderRadius: "14px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    textDecoration: "none",
                    width: "100%",
                    fontWeight: "700",
                    fontSize: "17px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={Download}
                    alt="download icon"
                    style={{ marginRight: "8px" }}
                  />
                  {t("downloadBtn")}
                  <div
                    style={{
                      background: "rgba(153, 108, 66, 0.1)",
                      fontSize: "12px",
                      borderRadius: "24px",
                      padding: "2px 6px",
                      marginLeft: "5px",
                    }}
                  >
                    {" "}
                    {formatFileSize(
                      currentBookVersion?.result?.data[0]?.bookFile?.fileSize
                    )}
                  </div>
                </a>
              )}
            </section>
            <section className={styles.reviewsSection}>
              <div className={styles.section_title}>{t("reviews")}</div>
              <div className={styles.overallRating}>
                {book?.rating !== undefined && (
                  <Rating
                    count={5}
                    value={Number(book.rating) > 0 ? Number(book.rating) : 0}
                    size={24}
                    edit={false}
                    activeColor="#996C42"
                    emptyColor="#ccc"
                    half={true}
                  />
                )}
                <div className={styles.rating_count}>
                  {book?.rating ? Number(book.rating).toFixed(1) : "N/A"}
                </div>
                <span>
                  ({book?.reviewCount} {t("reviews").toLowerCase()})
                </span>
              </div>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Review
                    key={review.id}
                    id={review.id}
                    rating={review.rating}
                    text={review.text}
                    reviewer={review?.user?.userName || "Anonymous"}
                    reviewerId={review?.user?.id}
                    deleteReview={deleteReview}
                  />
                ))
              ) : (
                <p>{t("noReviewsAvailable")}</p>
              )}
              <Button
                style={{
                  color: "#996C42",
                  border: "2px solid rgba(153, 108, 66, 0.2)",
                  borderRadius: "14px",
                  background: "transparent",
                }}
                onClick={() => {
                  setIsReviewModalOpen(true);
                }}
                variant="Transparent"
              >
                {t("writeReviewBtn")}
                <img
                  style={{ marginLeft: "10px" }}
                  src={ReviewIcon}
                  alt="icon"
                />
              </Button>
            </section>
            <section>
              <PageBooksList
                books={similarBooks}
                title={t("titleSimilarBooks")}
                seeAllLink={routes.similarBooks}
                getBook={getBook}
              />
            </section>
          </div>
        </div>
        <LanguageModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          languages={languages}
          defaultLanguage={defaultLanguage}
          onLanguageSelect={onLanguageSelect}
          currentSelectedLanguage={selectedLanguage}
        />
        <ReviewModal
          reviewSubmit={reviewSubmit}
          book={book}
          isModalOpen={isReviewModalOpen}
          setIsModalOpen={setIsReviewModalOpen}
        />
      </div>
    </div>
  );
};

export default Book;
