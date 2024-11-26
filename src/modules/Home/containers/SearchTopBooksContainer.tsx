import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLazySelector } from "hooks";
import { getBookById, getTopBooks } from "../slices/home";
import BooksComponent from "../components/AllBooksComponents/BooksComponent";
import { routes } from "../routing";
import { useHistory, useParams } from "react-router-dom";

const SearchTopBooksContainer: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { id } = useParams<{ id: string }>();
  const searchFilter = `[categories.id][in]=${id}`;

  const { topBooks } = useLazySelector(({ home }) => {
    const { topBooks } = home;
    return {
      topBooks,
    };
  });

  // const dateOrder = "[dateAdded]=desc";

  const getBook = useCallback((id) => {
    dispatch(getBookById(id.toString()));
    history.push(`${routes.book}/${id}`);
  }, []);

  useEffect(() => {
    dispatch(
      getTopBooks({
        limit: "20",
        page: "1",
        // order: dateOrder,
        order: null,
        filter: searchFilter,
      })
    );
  }, []);

  return (
    <BooksComponent
      books={topBooks?.result?.data}
      getBook={getBook}
      title="Top Books"
    />
  );
};

export default SearchTopBooksContainer;
