import { useCallback, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { logoutUser } from "core/session/slices/session";
import { Home } from "modules/Home/components";
import { getNewBooks, getSuggestedBooks, getTopBooks } from "../slices/home";
import { UserContext } from "../../../core/contexts";
import { useHistory } from "react-router-dom";
import { routes } from "../routing";
import { clearBooks } from "../slices/home";
import { getLanguages, getLocalization } from "../../Auth/slices/auth";

const HomeContainer: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const value = useContext(UserContext);
  const habitsCategories = value?.readingHabits
    .map((genre: { id: string; name: string; colour: string }) => genre.id)
    .join(",");

  const {
    topBooks,
    newBooks,
    suggestedBooks,
    isTopBooksLoading,
    isNewBooksLoading,
    isSuggestedBooksLoading,
  } = useLazySelector(({ home }) => {
    const { topBooks, newBooks, suggestedBooks } = home;
    const { isLoading: isTopBooksLoading } = topBooks;
    const { isLoading: isNewBooksLoading } = newBooks;
    const { isLoading: isSuggestedBooksLoading } = suggestedBooks;
    return {
      topBooks,
      newBooks,
      suggestedBooks,
      isTopBooksLoading,
      isNewBooksLoading,
      isSuggestedBooksLoading,
    };
  });

  const { result: languages } = useLazySelector(
    ({ auth }) => auth.languages || {}
  );
  console.log("languages", languages?.data);

  const appLanguage = sessionStorage.getItem("appLanguage");
  const parsedAppLanguage = appLanguage
    ? JSON.parse(appLanguage)
    : value?.language?.isoCode2char;

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(parsedAppLanguage.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const getBook = useCallback((id) => {
    history.push(`${routes.book}/${id}`);
  }, []);

  const suggestedFilter = `[categories.id][in]=${habitsCategories}`;
  console.log("suggestedFilter", suggestedFilter);
  // const ratingOrder = "[rating]=desc";

  useEffect(() => {
    dispatch(clearBooks());
    dispatch(
      getTopBooks({
        limit: "3",
        page: "1",
        order: "",
        filter: null,
      })
    );
    dispatch(
      getNewBooks({
        limit: "6",
        page: "1",
        order: "[dateAdded]=desc",
        filter: null,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (habitsCategories) {
      dispatch(
        getSuggestedBooks({
          limit: "6",
          page: "1",
          order: "",
          filter: suggestedFilter,
        })
      );
    }
  }, [dispatch, suggestedFilter]);

  useEffect(() => {
    dispatch(getLanguages());
  }, [dispatch]);

  return (
    <>
      <Home
        getBook={getBook}
        topBooks={topBooks?.result?.data}
        newBooks={newBooks?.result?.data}
        suggestedBooks={suggestedBooks?.result?.data}
        onLogout={handleLogout}
        isTopBooksLoading={isTopBooksLoading}
        isNewBooksLoading={isNewBooksLoading}
        isSuggestedBooksLoading={isSuggestedBooksLoading}
      />
    </>
  );
};

export default HomeContainer;
