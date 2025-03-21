import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { Reading } from "../components";
import {
  addToShelf,
  clearBooks,
  getBookshelfById,
  getReadBook,
  setReadingBook,
} from "../slices/home";
import { useDispatch } from "react-redux";
import { useLazySelector } from "../../../hooks";
import { UserContext } from "../../../core/contexts";
import { SetReadingBookPayload } from "../slices/home/types";
import { getLocalization } from "../../Auth/slices/auth";

interface PageContent {
  fileType: "txt" | "html" | "pdf";
  content: string;
  pdfPage?: number; // Add pdfPage as an optional field
}

const ReadingContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const value = useContext(UserContext);
  const dispatch = useDispatch();

  const [page, setPage] = useState<number | null>(null);
  const [pagesContent, setPagesContent] = useState<PageContent[]>([]);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState<number>(0);
  const prevTotalPages = useRef<number>(0);
  const [maxLoadPage, setMaxLoadPage] = useState<number>(0);
  const [featurePageFromServer, setFeaturePageFromServer] = useState<
    number | null
  >(1);

  const { currentReadBook, isLoading, currentBookshelfBook } = useLazySelector(
    ({ home }) => ({
      currentReadBook: home.currentReadBook,
      isLoading: home.currentReadBook.isLoading,
      currentBookshelfBook: home.currentBookshelfBook,
    })
  );
  console.log(1111, pagesContent);
  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  useEffect(() => {
    const fetchBookshelfData = async () => {
      if (value?.id && id) {
        try {
          await dispatch(
            addToShelf({
              user: { id: +value.id },
              book: { id: +id },
              isFavourited: true,
              readingState: "added",
            })
          );
          await dispatch(
            getBookshelfById({
              userId: +value.id,
              bookId: +id,
            })
          );
        } catch (error) {
          console.error(
            "Error adding to shelf or fetching bookshelf data:",
            error
          );
        }
      }
    };

    fetchBookshelfData();
  }, [dispatch, value?.id, id]);

  useEffect(() => {
    if (currentBookshelfBook?.result) {
      const { readingState, lastPage } = currentBookshelfBook.result;

      if (readingState === "added") {
        setFeaturePageFromServer(1);
      } else if (readingState === "reading" && lastPage) {
        setFeaturePageFromServer(lastPage);
      }
    }
  }, [currentBookshelfBook]);

  useEffect(() => {
    dispatch(clearBooks());
    setPagesContent([]);
    setLoadedPages(new Set());
    setTotalPages(0);
    prevTotalPages.current = 0;

    setPage(featurePageFromServer);
  }, [dispatch, id, featurePageFromServer]);

  useEffect(() => {
    const currentBookLang = sessionStorage.getItem("currentBookLanguage");
    const parseLang = JSON.parse(currentBookLang || "{}");
    const langId = parseLang?.id || value?.bookLanguage?.id || "7";

    if (page !== null && !loadedPages.has(page)) {
      dispatch(getReadBook({ bookId: id, langId, page: page.toString() }));
    }
  }, [id, dispatch, page, loadedPages]);

  useEffect(() => {
    if (currentReadBook?.result) {
      const {
        fileType,
        text,
        html,
        pdfPage,
        totalPages: newTotalPages,
      } = currentReadBook.result;

      if (fileType && (text || html)) {
        const newPageContent: PageContent = {
          fileType,
          content: fileType === "txt" ? text : html,
        };

        setPagesContent((prev) => {
          if (!prev.some((p) => p.content === newPageContent.content)) {
            if (page && page < featurePageFromServer!) {
              return [newPageContent, ...prev];
            }
            return [...prev, newPageContent];
          }
          return prev;
        });
        setLoadedPages((prev) => new Set(prev.add(page!)));
      }

      // Handle PDF content
      if (fileType === "pdf" && pdfPage) {
        const newPageContent: PageContent = {
          fileType,
          content: "PDF content",
          pdfPage,
        };

        setPagesContent((prev) => {
          if (!prev.some((p) => p.pdfPage === newPageContent.pdfPage)) {
            if (page && page < featurePageFromServer!) {
              return [newPageContent, ...prev];
            }
            return [...prev, newPageContent];
          }
          return prev;
        });
        setLoadedPages((prev) => new Set(prev.add(page!)));
      }

      // Update total pages
      if (newTotalPages !== prevTotalPages.current) {
        setTotalPages(newTotalPages);
        prevTotalPages.current = newTotalPages;
      }
    }
  }, [currentReadBook, page, featurePageFromServer]);

  const handleNext = () => {
    setPage((prevPage) => (prevPage !== null ? prevPage + 1 : 1));
  };

  const handlePrev = () => {
    setPage((prevPage) =>
      prevPage !== null && prevPage > 1 ? prevPage - 1 : 1
    );
  };

  const saveProgress = () => {
    if (value?.id && id) {
      const payload: SetReadingBookPayload = {
        user: { id: +value.id },
        book: { id: +id },
        lastPage: maxLoadPage,
        progress: totalPages > 0 ? (maxLoadPage / totalPages) * 100 : 0,
        readingState: "reading",
      };

      dispatch(setReadingBook(payload));
    }
  };

  useEffect(() => {
    return () => {
      if (!location.pathname.includes("reading")) {
        saveProgress();
        setFeaturePageFromServer(null);
        dispatch(clearBooks());
        sessionStorage.removeItem("currentBookLanguage");
      }
    };
  }, [location.pathname, maxLoadPage]);

  return (
    <Reading
      pagesContent={pagesContent}
      totalPages={totalPages}
      isLoading={isLoading}
      onNext={handleNext}
      onPrev={handlePrev}
      featurePageFromServer={featurePageFromServer}
      maxLoadPage={maxLoadPage}
      setMaxLoadPage={setMaxLoadPage}
    />
  );
};

export default ReadingContainer;
