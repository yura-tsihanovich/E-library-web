import React, { useEffect, useRef, useState } from "react";
import styles from "./Reading.module.scss";
import BackIcon from "../../../../assets/images/icons/backPage.svg";
import { useHistory } from "react-router-dom";
import { Divider, List, Progress } from "antd";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import SpinnerBrown from "../../../../components/common/SpinnerBrown";
import { ReaderByType } from "../../../../components/readerByType";

interface ReadingProps {
  pagesContent: any;
  totalPages: number;
  isLoading: boolean;
  onNext: () => void;
  onPrev: () => void;
  featurePageFromServer: any;
  maxLoadPage: number;
  setMaxLoadPage: (num: number) => void;
}

const Reading: React.FC<ReadingProps> = ({
  pagesContent,
  totalPages,
  isLoading,
  onNext,
  onPrev,
  featurePageFromServer,
  maxLoadPage,
  setMaxLoadPage,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(10);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  useEffect(() => {
    if (featurePageFromServer) {
      setMaxLoadPage(featurePageFromServer);
    }
  }, [featurePageFromServer, setMaxLoadPage]);

  useEffect(() => {
    if (pagesContent.length > 0 && containerRef.current && isFirstLoad) {
      setTimeout(() => {
        containerRef.current!.scrollTop = 50;
        setIsFirstLoad(false);
      }, 300);
    }
  }, [pagesContent, isFirstLoad]);

  if (pagesContent.length > 0) {
    const pageNumbers = pagesContent
      .map((page: any) => Number(page))
      .filter((num: any) => !isNaN(num)); // Filter out NaN values

    if (pageNumbers.length > 0) {
      const maxPage = Math.max(...pageNumbers);
      setMaxLoadPage(maxPage);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

      if (
        scrollTop + clientHeight >= scrollHeight - 10 &&
        !isLoading &&
        currentPage < totalPages
      ) {
        onNext();
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
      }

      if (scrollTop <= 10 && !isLoading && currentPage > 1) {
        onPrev();
        setCurrentPage((prev) => Math.max(prev - 1, 1));

        if (scrollTop <= 10 && !isFirstLoad) {
          setTimeout(() => {
            containerRef.current!.scrollTop = 100;
          }, 300);
        }
      }
    };

    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [onNext, onPrev, isLoading, currentPage, totalPages, isFirstLoad]);

  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const scrollableDivRef = useRef<any>(undefined);

  useEffect(() => {
    const scrollableDiv = scrollableDivRef.current.el as HTMLDivElement;

    const handleScroll = () => {
      if (scrollableDiv) {
        const { scrollTop, clientHeight } = scrollableDiv;

        const childrenNode =
          scrollableDiv.getElementsByTagName("ul")[0].childNodes[0];
        // @ts-ignore
        const childrenNodeHeight = childrenNode.offsetHeight;

        const scrollPosition = scrollTop + clientHeight;
        // const pageHeight = scrollHeight / totalPages;

        const newPage = Math.floor(scrollPosition / childrenNodeHeight) + 1;
        setCurrentPageNumber(newPage);
      }
    };

    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [totalPages]);

  return (
    <div>
      <div
        onClick={() => history.goBack()}
        className={styles.backBtnRelativePage}
      >
        <img style={{ marginRight: 9 }} src={BackIcon} alt="Back arrow" />
        {t("backBtn")}
      </div>

      <div
        className={styles.home_page}
        id="scrollableDiv"
        style={{
          height: "calc(100vh - 155px)",
          overflow: "auto",
          padding: "0 16px",
          border: "1px solid rgba(140, 140, 140, 0.35)",
        }}
      >
        <InfiniteScroll
          dataLength={pagesContent.length}
          next={onNext}
          hasMore={maxLoadPage <= totalPages}
          loader={
            <svg className="spinner" viewBox="0 0 50 50">
              <circle
                className={styles.path}
                cx="25"
                cy="25"
                r="20"
                fill="none"
                strokeWidth="5"
              />
            </svg>
          }
          endMessage={<Divider />}
          scrollableTarget="scrollableDiv"
          ref={scrollableDivRef}
        >
          <List
            className={styles.listWrapper}
            dataSource={pagesContent}
            loading={{
              spinning: false,
              wrapperClassName: "noneSpinner",
            }}
            locale={{
              emptyText: () => null,
            }}
            renderItem={(page: any, index) => (
              <List.Item key={index} className={styles.listItem}>
                <ReaderByType
                  content={
                    page.fileType === "html" ? page.content : page.pdfPage
                  }
                  fileType={page.fileType}
                />
              </List.Item>
            )}
          />
          {isLoading && (
            <div style={{ textAlign: "center", padding: "10px" }}>
              <SpinnerBrown />
            </div>
          )}
        </InfiniteScroll>
      </div>

      <div className={styles.progressContent} style={{ marginTop: "20px" }}>
        <div style={{ textAlign: "center" }}>
          {currentPageNumber} of {totalPages}
        </div>
        <Progress
          percent={(currentPageNumber / totalPages) * 100}
          status="active"
          showInfo={false}
          strokeColor="#1890ff" // Customize the progress bar color if needed
        />
      </div>
    </div>
  );
};

export default Reading;
