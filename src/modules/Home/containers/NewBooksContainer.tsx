import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { clearBooks, getNewBooks, getBookById } from "../slices/home";
import BooksComponent from "../components/AllBooksComponents/BooksComponent";
import { routes } from "../routing";
import { useHistory } from "react-router-dom";
import booksImg from "../../../assets/images/icons/booksIcon.png";
import { UserContext } from "../../../core/contexts";
import { getLocalization } from "../../Auth/slices/auth";
import { useTranslation } from "react-i18next";

const NewBooksContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const value = useContext(UserContext);

  const authState = useLazySelector(({ auth }) => {
    return auth;
  });

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Destructure isLoading directly from `newBooks`
  const { newBooks, isLoading } = useLazySelector(({ home }) => {
    const { newBooks } = home;
    return {
      newBooks,
      isLoading: newBooks.isLoading,
    };
  });

  const limit = 6;

  const hasMoreBooks =
    (newBooks?.result?.total || 0) > (newBooks?.result?.data?.length || 0);

  const getBook = useCallback(
    (id: string | number) => {
      dispatch(getBookById(id.toString()));
      history.push(`${routes.book}/${id}`);
    },
    [dispatch, history]
  );

  const getBooksFilter = `${
    authState.userData.result?.kidsMode ? "[isAgeRestricted][eq]=0" : null
  }&filter[id][lte]=223`;

  useEffect(() => {
    dispatch(clearBooks());
    dispatch(
      getNewBooks({
        limit: limit.toString(),
        page: "1",
        order: "[dateAdded]=desc",
        filter: getBooksFilter,
      })
    );
  }, [dispatch]);

  const loadMoreBooks = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await dispatch(
        getNewBooks({
          limit: limit.toString(),
          page: nextPage.toString(),
          order: "[dateAdded]=desc",
          filter: getBooksFilter,
        })
      );
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more books:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <BooksComponent
      books={newBooks?.result?.data}
      getBook={getBook}
      title={
        <>
          {t("titleNewBooks")} <img src={booksImg} alt="books" />
        </>
      }
      onLoadMore={hasMoreBooks ? loadMoreBooks : undefined}
      isLoadingMore={loadingMore}
      hasMoreBooks={hasMoreBooks}
      isLoading={isLoading}
    />
  );
};

export default NewBooksContainer;
