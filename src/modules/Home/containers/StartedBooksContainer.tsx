import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { clearBooks, getStartedBooks } from "../slices/home";
import BooksComponent from "../components/AllBooksComponents/BooksComponent";
import { routes } from "../routing";
import { useHistory } from "react-router-dom";
import { UserContext } from "../../../core/contexts";
import { getLocalization } from "../../Auth/slices/auth";
import { useTranslation } from "react-i18next";

const StartedBooksContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const value = useContext(UserContext);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { startedBooks, isLoading } = useLazySelector(({ home }) => {
    const { startedBooks } = home;
    return {
      startedBooks,
      isLoading: startedBooks.isLoading,
    };
  });

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const limit = 6;

  const hasMoreBooks =
    (startedBooks?.result?.total || 0) >
    (startedBooks?.result?.data?.length || 0);

  const startedBooksList = startedBooks?.result?.data.map((item: any) => {
    return {
      ...item.book,
      isBookshelfStarted: true,
    };
  });

  const getBook = useCallback((id) => {
    history.push(`${routes.book}/${id}`);
  }, []);

  const startedFilter = "[readingState][eq]=reading";

  useEffect(() => {
    dispatch(clearBooks());
    if (value?.id) {
      const userIdFilter = `[user.id][eq]=${value.id}`;
      dispatch(
        getStartedBooks({
          limit: limit.toString(),
          page: "1",
          order: "",
          filter: startedFilter,
          userFilter: userIdFilter,
        })
      );
    }
  }, [value?.id, dispatch, startedFilter]);

  const loadMoreBooks = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const userIdFilter = `[user.id][eq]=${value.id}`;
    try {
      await dispatch(
        getStartedBooks({
          limit: limit.toString(),
          page: nextPage.toString(),
          order: "",
          filter: startedFilter,
          userFilter: userIdFilter,
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
      books={startedBooksList}
      getBook={getBook}
      title={t("started")}
      onLoadMore={hasMoreBooks ? loadMoreBooks : undefined}
      isLoadingMore={loadingMore}
      hasMoreBooks={hasMoreBooks}
      isLoading={isLoading}
    />
  );
};

export default StartedBooksContainer;
