import styles from "./SearchComponent.module.scss";
import React, { FC, useState } from "react";
import NoImg from "../../../../assets/images/NoImagePlaceholder.jpg";
import Search from "../../../../assets/images/icons/SearchIcon.svg";
import { Input, Skeleton } from "antd";
import { useTranslation } from "react-i18next";

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
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setDropdownVisible(false);
      setHasSearched(false);
      getBooksByName({});
    } else {
      getSearchBooks(value);
      setDropdownVisible(true);
    }
  };

  const handleBookSelect = (title: string) => {
    setSearchTerm(title);
    setHasSearched(true);
    setDropdownVisible(false);
    getBooksByName(title);
  };

  const filteredBooks = searchBooks.filter((book) =>
    book.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className={styles.searchBookInput}
            autoComplete="off"
          />
          {searchTerm && isDropdownVisible && filteredBooks.length > 0 && (
            <div className={styles.dropdown}>
              {filteredBooks.map((book, index) => (
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
          {searchTerm && filteredBooks.length === 0 && (
            <div className={styles.noResults}>No Results</div>
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
