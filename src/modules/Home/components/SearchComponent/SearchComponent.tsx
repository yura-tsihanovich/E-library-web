import styles from "./SearchComponent.module.scss";
import React, { FC, useState, useCallback } from "react";
import NoImg from "../../../../assets/images/NoImagePlaceholder.jpg";
import Search from "../../../../assets/images/icons/SearchIcon.svg";
import { Input, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import { LoadingOutlined } from "@ant-design/icons";

type CategoryData = {
  id: number;
  name: string;
  color: string;
  picture: {
    link: string;
  };
};

interface Author {
  name: string;
}

interface Book {
  id: string;
  title: string;
  bookCover: {
    link: string;
  };
  author: Author[];
}

interface SearchBooksComponentProps {
  categoriesData?: CategoryData[];
  getBooksByCategory: (id: any) => void;
  getSearchBooks: (text: string) => void;
  searchBooks: string[];
  getBooksByName: any;
  booksByQueryName: any;
  getBook: (id: any) => void;
  isLoading: boolean;
  isLoadingSearch?: boolean;
}

const SearchComponent: FC<SearchBooksComponentProps> = ({
  categoriesData = [],
  getBooksByCategory,
  getSearchBooks,
  searchBooks = [],
  getBooksByName,
  booksByQueryName,
  getBook,
  isLoading,
  isLoadingSearch,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      getSearchBooks(value);
    }, 300),
    [getSearchBooks]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setDropdownVisible(false);
      setHasSearched(false);
      getBooksByName({});
    } else {
      debouncedSearch(value);
      setDropdownVisible(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      handleBookSelect(searchTerm, true);
    }
  };

  const handleBookSelect = (title: string, isSingle: boolean = false) => {
    setSearchTerm(title);
    setHasSearched(true);
    setDropdownVisible(false);
    getBooksByName(title, isSingle);
  };

  return (
    <div className={styles.home_page}>
      <div className={styles.habit_wrap}>
        <div className={styles.searchWrapper}>
          <Input
            placeholder={t("searchPlaceholder")}
            prefix={<img src={Search} alt="search" />}
            id="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className={styles.searchBookInput}
            autoComplete="off"
          />
          {searchTerm && isDropdownVisible && searchBooks.length > 0 && (
            <div className={styles.dropdown}>
              {searchBooks.map((book, index) => (
                <div
                  key={index}
                  className={styles.dropdownItem}
                  onClick={() => handleBookSelect(book)}
                >
                  <img src={Search} alt="search" /> {book}
                </div>
              ))}
            </div>
          )}
          {searchTerm && searchBooks.length === 0 && (
            <div className={styles.noResults}>
              {" "}
              {isLoadingSearch ? <LoadingOutlined /> : "No Results"}
            </div>
          )}
        </div>

        {hasSearched && (
          <div className={styles.booksList}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={styles.newBook}>
                    <div className={styles.imgWrap}>
                      <Skeleton.Image
                        style={{ width: "142px", height: "175px" }}
                      />
                    </div>
                    <div className={styles.newBookTitle}>
                      <Skeleton active paragraph={{ rows: 1 }} title={false} />
                    </div>
                    <div className={styles.newBookAuthor}>
                      <Skeleton active paragraph={{ rows: 1 }} title={false} />
                    </div>
                  </div>
                ))
              : booksByQueryName.map((book: Book) => (
                  <div
                    key={book.id}
                    className={styles.newBook}
                    onClick={() => getBook(book.id)}
                  >
                    <div className={styles.imgWrap}>
                      <img src={book.bookCover?.link} alt={book.title} />
                    </div>
                    <div className={styles.newBookTitle}>{book.title}</div>
                    <div className={styles.newBookAuthor}>
                      {book.author.map((author) => author.name).join(", ")}
                    </div>
                  </div>
                ))}
          </div>
        )}

        {!searchTerm && (
          <div className={styles.categoryFilter}>
            <div className={styles.page_title}>
              <span>{t("allGenres")}</span>
            </div>
            <div className={styles.grid_container}>
              {categoriesData.map((category: CategoryData) => (
                <div
                  onClick={() => {
                    getBooksByCategory(category.id);
                  }}
                  key={category.id}
                  className={styles.grid_item}
                  style={{
                    backgroundColor: category.color,
                  }}
                >
                  {category.name}
                  <div className={styles.backgroundImg}>
                    <img
                      src={category.picture.link || NoImg}
                      alt={category.name}
                      className={styles.bookCoverImage}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
