import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { clearBooks, getNotStartedBooks } from "../slices/home";
import BooksComponent from "../components/AllBooksComponents/BooksComponent";
import { routes } from "../routing";
import { useHistory } from "react-router-dom";
import { UserContext } from "../../../core/contexts";
import { getLocalization } from "../../Auth/slices/auth";
import { useTranslation } from "react-i18next";

const NotStartedBooksContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const value = useContext(UserContext);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { notStartedBooks, isLoading } = useLazySelector(({ home }) => {
    const { notStartedBooks } = home;
    return {
      notStartedBooks,
      isLoading: notStartedBooks.isLoading,
    };
  });

  const limit = 6;

  const hasMoreBooks =
    (notStartedBooks?.result?.total || 0) >
    (notStartedBooks?.result?.data?.length || 0);

  const notStartedBooksList = notStartedBooks?.result?.data.map((item: any) => {
    return {
      ...item.book,
      isBookshelfNotStarted: true,
    };
  });

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const getBook = useCallback((id) => {
    history.push(`${routes.book}/${id}`);
  }, []);

  const favouriteFilter = "[readingState][eq]=added";

  useEffect(() => {
    dispatch(clearBooks());
    if (value?.id) {
      const userIdFilter = `[user.id][eq]=${value.id}`;
      dispatch(
        getNotStartedBooks({
          limit: limit.toString(),
          page: "1",
          order: "",
          filter: favouriteFilter,
          userFilter: userIdFilter,
        })
      );
    }
  }, [value?.id, dispatch, favouriteFilter]);

  const loadMoreBooks = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const userIdFilter = `[user.id][eq]=${value.id}`;
    try {
      await dispatch(
        getNotStartedBooks({
          limit: limit.toString(),
          page: nextPage.toString(),
          order: "",
          filter: favouriteFilter,
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
      books={notStartedBooksList}
      getBook={getBook}
      title={t("notStarted")}
      onLoadMore={hasMoreBooks ? loadMoreBooks : undefined}
      isLoadingMore={loadingMore}
      hasMoreBooks={hasMoreBooks}
      isLoading={isLoading}
    />
  );
};

export default NotStartedBooksContainer;
