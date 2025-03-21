import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { clearBooks, getBookById, getTopBooks } from "../slices/home";
import BooksComponent from "../components/AllBooksComponents/BooksComponent";
import { routes } from "../routing";
import { useHistory, useParams } from "react-router-dom";
import { getLocalization } from "../../Auth/slices/auth";
import { UserContext } from "../../../core/contexts";
import { useTranslation } from "react-i18next";

const SearchTopBooksContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const value = useContext(UserContext);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { id } = useParams<{ id: string }>();
  const searchFilter = `[categories.id][in]=${id}`;

  const { topBooks, isLoading } = useLazySelector(({ home }) => {
    const { topBooks } = home;
    return {
      topBooks,
      isLoading: topBooks.isLoading,
    };
  });

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const limit = 6;

  const hasMoreBooks =
    (topBooks?.result?.total || 0) > (topBooks?.result?.data?.length || 0);

  // const dateOrder = "[dateAdded]=desc";

  const getBook = useCallback((id) => {
    dispatch(getBookById(id.toString()));
    history.push(`${routes.book}/${id}`);
  }, []);

  useEffect(() => {
    dispatch(clearBooks());
    dispatch(
      getTopBooks({
        limit: limit.toString(),
        page: "1",
        order: null,
        filter: searchFilter,
      })
    );
  }, [dispatch, searchFilter]);

  const loadMoreBooks = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await dispatch(
        getTopBooks({
          limit: limit.toString(),
          page: nextPage.toString(),
          order: null,
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
      books={topBooks?.result?.data}
      getBook={getBook}
      title={t("titleTopBooks")}
      onLoadMore={hasMoreBooks ? loadMoreBooks : undefined}
      isLoadingMore={loadingMore}
      hasMoreBooks={hasMoreBooks}
      isLoading={isLoading}
    />
  );
};

export default SearchTopBooksContainer;
