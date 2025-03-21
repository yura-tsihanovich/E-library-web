import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { clearBooks, getBookById, getNewBooks } from "../slices/home";
import BooksComponent from "../components/AllBooksComponents/BooksComponent";
import { routes } from "../routing";
import { useHistory, useParams } from "react-router-dom";
import { UserContext } from "../../../core/contexts";
import { getLocalization } from "../../Auth/slices/auth";
import { useTranslation } from "react-i18next";

const SearchNewBooksContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const value = useContext(UserContext);

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const { id } = useParams<{ id: string }>();

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

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

  const searchFilter = `[categories.id][in]=${id}`;
  const dateOrder = "[dateAdded]=desc";

  const getBook = useCallback((id) => {
    dispatch(getBookById(id.toString()));
    history.push(`${routes.book}/${id}`);
  }, []);

  useEffect(() => {
    dispatch(clearBooks());
    dispatch(
      getNewBooks({
        limit: limit.toString(),
        page: "1",
        order: dateOrder,
        filter: searchFilter,
      })
    );
  }, [dispatch, searchFilter]);

  const loadMoreBooks = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await dispatch(
        getNewBooks({
          limit: limit.toString(),
          page: nextPage.toString(),
          order: dateOrder,
          filter: searchFilter,
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
      title={t("titleTopBooks")}
      onLoadMore={hasMoreBooks ? loadMoreBooks : undefined}
      isLoadingMore={loadingMore}
      hasMoreBooks={hasMoreBooks}
      isLoading={isLoading}
    />
  );
};

export default SearchNewBooksContainer;
