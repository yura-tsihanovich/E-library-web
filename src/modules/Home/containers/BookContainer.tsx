import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Book } from "../components";
import { useLazySelector } from "../../../hooks";
import {
  addReview,
  clearBooks,
  clearCurrentVersion,
  deleteYourReview,
  getBookById,
  getBookVersions,
  getReviews,
  getSimilarBooks,
} from "../slices/home";
import { routes } from "../routing";
import { useHistory } from "react-router-dom";

const BookContainer: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { currentBook, reviews, similarBooks, bookVersions } = useLazySelector(
    ({ home }) => {
      const {
        currentBook,
        reviews,
        similarBooks,
        currentBookVersion,
        bookVersions,
      } = home;
      return {
        currentBook,
        reviews,
        similarBooks,
        currentBookVersion,
        bookVersions,
      };
    }
  );

  const allTranslations =
    (bookVersions &&
      bookVersions?.result?.data
        .filter((book: any) => book.language.id !== 5)
        .map((book: any) => ({
          id: book.language.id,
          name: 123,
          isoCode: book.language.isoCode,
          isoCode2char: book.language.isoCode2char,
          flag: book.language.flag,
          translationType: book.translationType,
        }))) ||
    [];

  const getBook = useCallback(
    (id) => {
      dispatch(getBookById(id.toString()));
    },
    [dispatch]
  );
  useEffect(() => {
    dispatch(clearBooks());
    return () => {
      dispatch(clearCurrentVersion());
    };
  }, []);

  useEffect(() => {
    if (currentBook?.result?.id) {
      dispatch(
        getBookVersions({
          page: "1",
          limit: "50",
          filterId: `[coreBook.id][eq]=${currentBook?.result?.id}`,
        })
      );
    }
  }, [dispatch, currentBook?.result?.id]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("selectedLanguage");
    };
  }, []);

  const fetchReviews = useCallback(() => {
    if (currentBook?.result?.id) {
      dispatch(
        getReviews({
          id: currentBook.result.id,
          page: "1",
          limit: "10",
        })
      );
    }
  }, [dispatch, currentBook]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const reviewSubmit = async (params: any) => {
    try {
      await dispatch(addReview(params));
      fetchReviews();
      if (currentBook?.result?.id) {
        getBook(currentBook.result.id); // перезапрашиваем книгу
      }
    } catch (error) {
      console.error("Error adding review or fetching reviews:", error);
    }
  };

  const deleteReview = useCallback(
    async (id) => {
      try {
        await dispatch(deleteYourReview(id.toString()));
        fetchReviews();
        if (currentBook?.result?.id) {
          getBook(currentBook.result.id); // перезапрашиваем книгу
        }
      } catch (error) {
        console.error("Error deleting review or fetching reviews:", error);
      }
    },
    [dispatch, fetchReviews, getBook, currentBook]
  );

  const habitsCategories = currentBook?.result?.categories
    ?.map((genre: { id: string; name: string; colour: string }) => genre.id)
    .join(",");
  const [similarBooksFetched, setSimilarBooksFetched] = useState(false);

  useEffect(() => {
    if (habitsCategories && !similarBooksFetched) {
      dispatch(
        getSimilarBooks({
          limit: "3",
          page: "1",
          order: "[rating]=desc",
          filter: `[categories.id][in]=${habitsCategories}`,
        })
      );
      setSimilarBooksFetched(true);
    }
  }, [dispatch, habitsCategories, similarBooksFetched]);

  const getAuthorBooks = useCallback(
    (id) => {
      history.push(`${routes.authorBooks}/${id}`);
    },
    [history]
  );

  const startRead = (value: { bookId: string }) => {
    history.push(`${routes.reading}/${value.bookId}`);
  };

  const startListen = (value: { bookId: string }) => {
    history.push(`${routes.audioBook}/${value.bookId}`);
  };

  return (
    <Book
      getBook={getBook}
      languages={allTranslations}
      reviewsRating={reviews?.result?.rating}
      reviewSubmit={reviewSubmit}
      similarBooks={similarBooks?.result?.data}
      deleteReview={deleteReview}
      getAuthorBooks={getAuthorBooks}
      startRead={startRead}
      startListen={startListen}
    />
  );
};

export default BookContainer;
