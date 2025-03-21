import React, { FC, useContext, useEffect, useState } from "react";
import { Input, Modal, Skeleton } from "antd";
import commonStyles from "../../../../../assets/css/commonStyles/CommonStyles.module.scss";
import Close from "../../../../../assets/images/icons/Close.svg";
import styles from "./SearchBookModal.module.scss";
import Search from "../../../../../assets/images/icons/SearchIcon.svg";
import { routes } from "../../../routing";
import { Link } from "react-router-dom";
import { UserContext } from "../../../../../core/contexts";
import { getLocalization } from "../../../../Auth/slices/auth";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

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

interface NotificationsModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  getSearchBooks: (text: string) => void;
  searchBooks: string[];
  getBooksByName: any;
  booksByQueryName: any;
  isLoading: boolean;
}

const SearchBookModal: FC<NotificationsModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  getSearchBooks,
  searchBooks = [],
  getBooksByName,
  booksByQueryName,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const value = useContext(UserContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setDropdownVisible(false); // Скрываем dropdown
      setHasSearched(false); // Сбрасываем состояние поиска
      getBooksByName({}); // Сбрасываем booksByQueryName
    } else {
      getSearchBooks(value);
      setDropdownVisible(true); // Показываем dropdown при вводе текста
    }
  };

  const handleBookSelect = (title: string) => {
    setSearchTerm(title);
    setHasSearched(true); // Устанавливаем флаг для выполнения поиска
    setDropdownVisible(false); // Скрыть dropdown после выбора
    getBooksByName(title);
  };

  const filteredBooks = searchBooks.filter((book) =>
    book.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hideModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      title={
        <div>
          <div className="custom-modal-title">{t("selectBookBtn")}</div>
          <div style={{ marginTop: "20px" }}>
            <Input
              placeholder={t("searchPlaceholder")}
              prefix={<img src={Search} alt="search" />}
              id="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchBookInput}
              autoComplete="off"
            />
          </div>
        </div>
      }
      visible={isModalOpen}
      onCancel={hideModal}
      className="custom-modal-settings"
      footer={null}
      closeIcon={
        <img
          className={commonStyles.modalCloseIcon}
          src={Close}
          alt="close-icon"
        />
      }
    >
      <div className={styles.modalContent}>
        <div className={styles.searchWrapper}>
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
                        style={{ width: "125px", height: "175px" }}
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
                  <Link
                    key={book.id}
                    className={styles.newBook}
                    to={`${routes.askQuestion}/${book.id}`}
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                  >
                    <div className={styles.imgWrap}>
                      <img src={book.bookCover?.link} alt={book.title} />
                    </div>
                    <div className={styles.newBookTitle}>{book.title}</div>
                    <div className={styles.newBookAuthor}>
                      {book.author.map((author) => author.name).join(", ")}
                    </div>
                  </Link>
                ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchBookModal;
