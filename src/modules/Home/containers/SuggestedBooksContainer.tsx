import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { clearBooks, getBookById, getSuggestedBooks } from "../slices/home";
import { routes } from "../routing";
import { useHistory } from "react-router-dom";
import BooksComponent from "../components/AllBooksComponents/BooksComponent";
import { UserContext } from "../../../core/contexts";
import { getLocalization } from "../../Auth/slices/auth";
import { useTranslation } from "react-i18next";

const SuggestedBooksContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const value = useContext(UserContext);
  const habitsCategories = value?.readingHabits
    .map((genre: { id: string; name: string; colour: string }) => genre.id)
    .join(",");

  const { suggestedBooks, isLoading } = useLazySelector(({ home }) => {
    const { suggestedBooks } = home;
    return {
      suggestedBooks,
      isLoading: suggestedBooks.isLoading,
    };
  });
  const authState = useLazySelector(({ auth }) => {
    return auth;
  });

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const limit = 6;

  const hasMoreBooks =
    (suggestedBooks?.result?.total || 0) >
    (suggestedBooks?.result?.data?.length || 0);

  const getBook = useCallback((id) => {
    dispatch(getBookById(id.toString()));
    history.push(`${routes.book}/${id}`);
  }, []);

  const isAgeRestricted = authState.userData.result?.kidsMode
    ? `[isAgeRestricted][eq]=0`
    : "";

  const suggestedFilter = `${isAgeRestricted}[categories.id][in]=${habitsCategories}&filter[id][lte]=223`;

  useEffect(() => {
    dispatch(clearBooks());
    dispatch(
      getSuggestedBooks({
        limit: limit.toString(),
        page: "1",
        order: "",
        filter: suggestedFilter,
      })
    );
  }, [dispatch, suggestedFilter]);

  const loadMoreBooks = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await dispatch(
        getSuggestedBooks({
          limit: limit.toString(),
          page: nextPage.toString(),
          order: "",
          filter: suggestedFilter,
        })
      );
      setPage(nextPage);
    } catch (error) {
      console.error("Failed to load more books:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // useEffect(() => {
  //   dispatch(clearBooks());
  //   dispatch(
  //     getNewBooks({
  //       limit: limit.toString(),
  //       page: "1",
  //       order: "[dateAdded]=desc",
  //       filter: null,
  //     })
  //   );
  // }, [dispatch]);

  return (
    <BooksComponent
      books={suggestedBooks?.result?.data}
      getBook={getBook}
      title={t("titleSuggestedForYou")}
      onLoadMore={hasMoreBooks ? loadMoreBooks : undefined}
      isLoadingMore={loadingMore}
      hasMoreBooks={hasMoreBooks}
      isLoading={isLoading}
    />
  );
};

export default SuggestedBooksContainer;
