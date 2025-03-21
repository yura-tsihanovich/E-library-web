import React, { useRef, useState, useEffect } from "react";
import styles from "./AudioBookComponent.module.scss";
import PrevPage from "../../../../assets/images/icons/prevPage.svg";
import BackS from "../../../../assets/images/icons/backS.svg";
import ForwardS from "../../../../assets/images/icons/forwardS.svg";
import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import BackIcon from "../../../../assets/images/icons/goBackIcon.svg";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface AudioBookComponentProps {
  currentAudioBook: any;
  setCurrentPage: any;
  currentBookVersion: any;
  book: any;
  currentPage: any;
  setMaxLoadPage: any;
}

const AudioBookComponent: React.FC<AudioBookComponentProps> = ({
  currentAudioBook,
  setCurrentPage,
  currentBookVersion,
  book,
  currentPage,
  setMaxLoadPage,
}) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const history = useHistory();
  console.log("currentBookVersion", currentBookVersion);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(percent) ? 0 : percent);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const handlePrevPage = () => {
    setCurrentPage((prev: string) =>
      parseInt(prev) > 1 ? (parseInt(prev) - 1).toString() : prev
    );
    setProgress(0);
  };

  const handleNextPage = () => {
    setCurrentPage((prev: string) => {
      const nextPage = (parseInt(prev) + 1).toString();

      setMaxLoadPage((prevMax: any) => Math.max(prevMax, parseInt(nextPage)));
      return nextPage;
    });
    setProgress(0);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
    }
  };

  const toggleSpeed = () => {
    if (audioRef.current) {
      const newSpeed = playbackRate === 1 ? 2 : 1;
      audioRef.current.playbackRate = newSpeed;
      setPlaybackRate(newSpeed);
    }
  };

  return (
    <div className={styles.audio_page_wrap}>
      <div className={styles.audio_page}>
        <div className={styles.absolutEffect} />
        <div className={styles.home_page}>
          <div className={styles.topNav}>
            <div
              onClick={() => history.goBack()}
              className={commonStyles.backBtnRelative}
            >
              <img style={{ marginRight: 9 }} src={BackIcon} alt="Back arrow" />
              {t("backBtn")}
            </div>
            <div className={styles.nowPlayingTitle}>Now playing</div>
            <button onClick={toggleSpeed} className={styles.speed_button}>
              {playbackRate}x
            </button>
          </div>
          <div className={styles.audio_page_content}>
            <div className={styles.audioImg}>
              <img
                src={currentBookVersion?.result?.data[0]?.locBookCover?.link}
                alt=""
              />
            </div>
            <div className={styles.pageProgress}>
              <div className={styles.pageInfo}>
                {currentPage} of{" "}
                {currentBookVersion?.result?.data?.[0]?.totalPages || 1}
              </div>
              <div className={styles.pageProgressBar}>
                <div
                  className={styles.pageProgressFill}
                  style={{
                    width: `${
                      (parseInt(currentPage) /
                        (currentBookVersion?.result?.data?.[0]?.totalPages ||
                          1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
            <div className={styles.audioTitle}>
              {currentBookVersion?.result?.data[0]?.title}
            </div>
            <div className={styles.authorTitle}>
              {book?.result?.author[0].name}
            </div>
            <div className={styles.controls}>
              <button
                onClick={handlePrevPage}
                className={styles.control_button}
              >
                <img src={PrevPage} alt="prev" />
              </button>
              <button onClick={skipBackward} className={styles.control_button}>
                <img src={BackS} alt="" />
              </button>
              <button onClick={togglePlay} className={styles.play_button}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button onClick={skipForward} className={styles.control_button}>
                <img src={ForwardS} alt="" />
              </button>
              <button
                onClick={handleNextPage}
                className={styles.control_button}
              >
                <img src={PrevPage} alt="prev" className={styles.flipIcon} />
              </button>
            </div>
            <div className={styles.progressPercentage}>
              {Math.round(progress)}%
            </div>
            <audio
              ref={audioRef}
              src={currentAudioBook?.result?.audioUrl}
              onEnded={() => {
                setIsPlaying(false);
                setProgress(0);
                const totalPages =
                  currentBookVersion?.result?.data?.[0]?.totalPages || 1;
                setCurrentPage((prev: string) => {
                  const nextPage = parseInt(prev) + 1;
                  const updatedPage =
                    nextPage <= totalPages ? nextPage.toString() : prev;

                  setMaxLoadPage((prevMax: any) =>
                    Math.max(prevMax, parseInt(updatedPage))
                  );
                  return updatedPage;
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioBookComponent;
