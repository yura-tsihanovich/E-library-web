import React, { useContext, useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Collapse } from "antd";
import styles from "./AskQuestionComponent.module.scss";
import Send from "../../../../assets/images/icons/sendIcon.svg";
import CollapseIcon from "../../../../assets/images/icons/CollapseIcon.svg";
import DocumentIcon from "../../../../assets/images/icons/document.svg";
import ClearIcon from "../../../../assets/images/icons/Clear.svg";
import ArrowDown from "../../../../assets/images/icons/arrowProfile.svg";
import ChatSpinner from "../../../../components/common/ChatSpinner";
import { SrsPlayer } from "../../../../components/common/SrsPlayer";
import ReactQuill from "react-quill";
import ChooseAvatar from "./common/ChooseAvatar/ChooseAvatar";
import ChooseAvatarStep2 from "./common/ChooseAvatarStep2/ChooseAvatarStep2";
import ChooseAvatarStep3 from "./common/ChooseAvatarStep3/ChooseAvatarStep3";
import ChooseAvatarStep4 from "./common/ChooseAvatarStep4/ChooseAvatarStep4";
import VoiceRecorder from "../../../../components/Voice/VoiceRecorder/VoiceRecorder";
import LanguageModal from "../../../Auth/components/LanguageModal";
import NoAvatar from "../../../../assets/images/icons/uploadBg.png";
import { useDispatch } from "react-redux";
import {
  selectAvatarLanguage,
  setAvatarStreamShow,
  setIsStopQuestion,
  setIsStreamShow,
  setStreamDone,
} from "../../slices/home";
import MetaModal from "../common/MetaModal/MetaModal";
import { UserContext } from "../../../../core/contexts";
// @ts-ignore
import silentAvatar from "../../../../assets/videos/silent.mp4";
import { useLazySelector } from "../../../../hooks";
import { getLocalization } from "../../../Auth/slices/auth";
import { useTranslation } from "react-i18next";
// import {useSocket} from "../../../../hooks/useSocket";

type Chat = {
  type: "user" | "system";
  message: string;
};

type LanguageType = {
  id: number;
  name: string;
  isoCode2char: string;
  flag: {
    link: string;
  };
};

type FormValues = {
  question: string;
};

interface AvatarData {
  id: number;
  name: string;
  avatarMiniature: {
    link: string;
  };
  avatarPicture: {
    link: string;
  };
}

type AskQuestionComponentProps = {
  setQuestion: (text: string) => void;
  clearMessages: () => void;
  messages: any;
  isLoading: boolean;
  title: string;
  metaData: any;
  avatars: any;
  setUserAvatar: (id: number) => void;
  chatHistory: any;
  languages: LanguageType[];
  indexName: string;
  isChooseAvatarPage?: boolean;
};

const { Panel } = Collapse;

const AskQuestionComponent: React.FC<AskQuestionComponentProps> = ({
  setQuestion,
  clearMessages,
  title,
  isLoading,
  metaData,
  avatars,
  setUserAvatar,
  chatHistory,
  languages,
  indexName,
  isChooseAvatarPage,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const value = useContext(UserContext);
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();
  const [messageClass, setMessageClass] = useState(styles.messageSystemChange);
  const [messageTime, setMessageTime] = useState<string>("");
  const [isCollapseVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const videoRef = useRef<HTMLVideoElement | any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [, setIsRecordingInProcess] = useState(false);
  const [, setFormData] = useState<FormData | undefined>();
  const quillRef = useRef<ReactQuill>(null);
  const cursorPositionRef = useRef<null | number>(null);
  const [url, setUrl] = useState<any>();
  const [, setIsStreamConnect] = useState(false);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [, setIsShowSilent] = useState();
  const [isFirst, setIsFirst] = useState(true);
  const [isEmpty, setIsEmpty] = useState(true);
  const [voiceChatHistory, setVoiceChatHistory] = useState<any>([]);

  console.log("chatHistory", chatHistory);
  console.log("voiceChatHistory", voiceChatHistory);

  const { avatarStreamShow, streamDone } = useLazySelector(({ home }) => {
    const { avatarStreamShow, streamDone } = home;
    return {
      avatarStreamShow,
      streamDone,
    };
  });

  const [initialSlide, setInitialSlide] = useState<number>(0);
  const [defaultAvatarId] = useState(value?.avatarSettings?.id || 1);
  const [currentImage, setCurrentImage] = useState<AvatarData | null>(null);

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  useEffect(() => {
    if (avatars?.result?.data?.length && value) {
      const initialAvatarIndex = avatars?.result?.data.findIndex(
        (avatar: AvatarData) => avatar.id === value?.avatarSettings?.id
      );
      console.log("initialAvatarIndex", initialAvatarIndex);
      const foundIndex = initialAvatarIndex !== -1 ? initialAvatarIndex : 0;
      console.log("foundIndex", foundIndex);
      setInitialSlide(foundIndex);

      const initialAvatar = avatars?.result?.data[foundIndex];
      setCurrentImage(initialAvatar);
      setSelectedAvatar(initialAvatar.avatarPicture.link);

      if (isChooseAvatarPage) {
        setCurrentStep(1);
      } else {
        setCurrentStep(foundIndex === 0 ? 1 : 4);
      }
    }
  }, [
    avatars,
    defaultAvatarId,
    setSelectedAvatar,
    setCurrentStep,
    value,
    isChooseAvatarPage,
  ]);

  const defaultLanguage = (languages || []).find(
    (lang) => lang.name === "English"
  ) || {
    id: 0,
    name: "Select Language",
    flag: { link: NoAvatar },
    isoCode2char: "code",
  };

  useEffect(() => {
    if (languages && languages.length > 0) {
      const englishLanguage = languages.find((lang) => lang.name === "English");
      if (englishLanguage) {
        setSelectedLanguage(englishLanguage);
      }
    }
  }, [languages]);

  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [chatHistory, isSending, voiceChatHistory]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const onLanguageSelect = (language: LanguageType) => {
    setSelectedLanguage(language);
    dispatch(selectAvatarLanguage(language));
    sessionStorage.setItem("selectedLanguage", JSON.stringify(language.id));
  };

  const addTextWithDelay = async (res: string) => {
    const quillEditor = quillRef?.current?.getEditor();

    if (res !== undefined) {
      if (cursorPositionRef.current !== null) {
        const position = cursorPositionRef.current;

        if (quillEditor) {
          quillEditor?.insertText(position, res);
          const result: any = position + res?.length;
          quillEditor?.setSelection(result);
        }
      }
    }
  };

  useEffect(() => {
    const fetchStreamUrl = async () => {
      const token = sessionStorage.getItem("SESSION_TOKEN");
      try {
        const response = await fetch(
          "https://elib.plavno.io:8080/api/v1/srs/url",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const text = await response.text();
        console.log("Response text (URL):", text);

        setUrl(text);
      } catch (error) {
        console.error("Error fetching stream URL:", error);
      }
    };
    fetchStreamUrl();
  }, []);

  const clickCursor = () => {
    if (cursorPositionRef.current === null) {
      const quillEditor = quillRef?.current?.getEditor();
      cursorPositionRef.current =
        quillEditor?.getText()?.length === 1
          ? 0
          : quillEditor?.getText()?.length || 0;
    }
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const currentTime = getCurrentTime();
    console.log("DATA", data);
    setQuestion(data.question);
    clearMessages();
    setMessageClass(styles.messageSystem);
    setMessageTime(currentTime);
    setIsSending(true);
    setIsStreamConnect(true);
    setValue("question", "");
    reset();
    setFormData(undefined);

    setTimeout(() => {
      setIsSending(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      e.preventDefault();
      handleSubmit((data) => {
        onSubmit(data);
        setIsStreamConnect(true);
        dispatch(setIsStreamShow(true));
        setIsEmpty(true);
        dispatch(setIsStopQuestion(false));
        dispatch(setStreamDone(true));
      })();
    }
  };

  const renderMetaData = () => {
    if (metaData && metaData.length > 0) {
      return metaData.map((item: any, index: number) => {
        const pageNumber = item?.meta?.loc?.pageNumber;
        const linesFrom = item?.meta?.loc?.lines?.from;
        const linesTo = item?.meta?.loc?.lines?.to;
        const contentExcerpt = item?.content?.substring(0, 300) || "";

        if (pageNumber && linesFrom && linesTo) {
          return (
            <Panel
              key={index}
              header={
                <div className={styles.panelHeader}>
                  <img
                    src={DocumentIcon}
                    alt="Document Icon"
                    className={styles.documentIcon}
                  />
                  <span>Page {pageNumber}</span>
                </div>
              }
              showArrow={false}
            >
              <div>
                <p>
                  <strong>Location:</strong> Page {pageNumber}, Lines{" "}
                  {linesFrom}-{linesTo}
                </p>
                <p>
                  <strong>Content Excerpt:</strong> {contentExcerpt}...
                </p>
              </div>
            </Panel>
          );
        } else {
          console.warn("Incomplete meta data at index:", index, item);
          return null;
        }
      });
    }
    return null;
  };

  useEffect(() => {
    let prevPath = location.pathname;

    return () => {
      if (
        prevPath.includes("ask_question") &&
        !location.pathname.includes("ask_question")
      ) {
        stopAvatarGeneration({ client_id: String(value.id) });
        setAvatarStreamShow(false);
        dispatch(setIsStopQuestion(true));
        dispatch(setStreamDone(false));
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (!location.pathname.includes("ask_question") && videoRef.current) {
        stopAvatarGeneration({ client_id: String(value.id) });
        videoRef.current.srcObject = null;
        setIsStreamConnect(false);
      }
    };

    handleRouteChange();

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [location.pathname]);

  const [chatMessages, setChatMessages] = useState<Chat[]>([]);

  useEffect(() => {
    setChatMessages(
      [...voiceChatHistory, ...chatHistory].sort(
        (a, b) =>
          new Date(`1970-01-01T${a.timestamp}Z`).getTime() -
          new Date(`1970-01-01T${b.timestamp}Z`).getTime()
      )
    );
  }, [chatHistory, voiceChatHistory]);

  const token = sessionStorage.getItem("SESSION_TOKEN");

  const stopAvatarGeneration = async (params: any) => {
    try {
      const response = await fetch(
        "https://avatar18877404.plavno.app:24000/stop",
        {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Success:", data);
    } catch (error) {
      console.error("Error stopping avatar generation:", error);
    }
  };
  console.log("stream_DONE", streamDone);

  return (
    <>
      {currentStep === 1 && (
        <ChooseAvatar
          avatars={avatars.result}
          setCurrentStep={setCurrentStep}
          setSelectedAvatar={setSelectedAvatar}
          setUserAvatar={setUserAvatar}
          initialSlide={initialSlide}
          setInitialSlide={setInitialSlide}
          defaultAvatarId={defaultAvatarId}
          currentImage={currentImage}
          setCurrentImage={setCurrentImage}
          isChooseAvatarPage
        />
      )}
      {currentStep === 2 && (
        <ChooseAvatarStep2
          setCurrentStep={setCurrentStep}
          selectedAvatar={selectedAvatar}
        />
      )}
      {currentStep === 3 && (
        <ChooseAvatarStep3
          setCurrentStep={setCurrentStep}
          selectedAvatar={selectedAvatar}
        />
      )}
      {currentStep === 4 && (
        <ChooseAvatarStep4
          setCurrentStep={setCurrentStep}
          selectedAvatar={selectedAvatar}
        />
      )}
      {currentStep === 5 && (
        <div className={styles.askQuestionWrap}>
          <div className={styles.bookTitle}>
            <div style={{ marginRight: 10 }}>
              {location.pathname.includes("ask_global_question")
                ? t("askGlobalTitle")
                : title}
            </div>
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                showModal();
              }}
              className={styles.languageSelectWrapper}
            >
              <div
                className={styles.languageSelect}
                style={{
                  backgroundImage: `url(${selectedLanguage.flag.link})`,
                }}
              ></div>
              <span>{selectedLanguage.name}</span>
            </div>
          </div>
          <div className={styles.askQuestionPage}>
            <div className={styles.avatarSide}>
              <div style={{ position: "relative", width: 300, height: 300 }}>
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: avatarStreamShow ? 1 : 0,
                    pointerEvents: avatarStreamShow ? "auto" : "none",
                    transition: "opacity 0.3s ease-in-out",
                  }}
                >
                  <SrsPlayer
                    url={url}
                    width={300}
                    height={300}
                    videoRef={videoRef}
                    options={{
                      autoPlay: true,
                      playsInline: true,
                      muted: false,
                      controls: true,
                    }}
                    rtcOpts={{
                      audio: {
                        enable: true,
                      },
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: avatarStreamShow ? 0 : 1,
                    pointerEvents: avatarStreamShow ? "none" : "auto",
                    transition: "opacity 0.3s ease-in-out",
                  }}
                >
                  <video width={300} height={300} loop autoPlay>
                    <source src={silentAvatar} type="video/mp4" />
                  </video>
                </div>
              </div>
              <VoiceRecorder
                setIsRecordingInProcess={setIsRecordingInProcess}
                addTextWithDelay={addTextWithDelay}
                selectedLanguage=""
                clickCursor={clickCursor}
                setFormData={setFormData}
                isLoadingData={false}
                setQuestion={setQuestion}
                link=""
                setIsStreamConnect={setIsStreamConnect}
                userId={value?.id?.toString()}
                selectedLanguageCode={selectedLanguage.isoCode2char}
                indexName={indexName}
                setIsShowSilent={setIsShowSilent}
                isFirst={isFirst}
                setIsFirst={setIsFirst}
                setChatHistory={setVoiceChatHistory}
                setMessageClass={setMessageClass}
                streamDone={streamDone}
              />
            </div>
            <div className={styles.chatContainer}>
              <div className={styles.gradientOverlay} />

              <div className={styles.chatContent} ref={chatContentRef}>
                {chatMessages.map((chat, index) => {
                  const isLastMessage = index === chatMessages.length - 1;

                  return (
                    <div
                      key={index}
                      className={
                        chat.type === "user" ? styles.messageUser : messageClass
                      }
                    >
                      <div
                        className={
                          chat.type === "user"
                            ? styles.userMessage
                            : styles.messageSystemContent
                        }
                      >
                        {chat.type !== "user" &&
                          isLastMessage &&
                          isLoading &&
                          !chat.message && <ChatSpinner />}
                        {chat.message}
                        {chat.type === "user" && (
                          <div className={styles.messageSystemBottom}>
                            <span className={styles.messageTime}>
                              {messageTime}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {metaData && metaData.length > 0 && !isLoading && !isSending && (
                <div
                  className={styles.collapseButton}
                  onClick={() => {
                    setIsMetaModalOpen(true);
                  }}
                >
                  <span style={{ paddingRight: 10 }}>
                    {isCollapseVisible
                      ? "Hide used resources"
                      : "Show used resources"}
                  </span>
                  <img
                    style={{
                      transform: `rotate(${isCollapseVisible ? 180 : 0}deg)`,
                    }}
                    src={isCollapseVisible ? ArrowDown : CollapseIcon}
                    alt="icon"
                  />
                </div>
              )}

              <div className={styles.collapseContent}>
                {isCollapseVisible && <Collapse>{renderMetaData()}</Collapse>}
              </div>

              <div className={styles.chatWrap}>
                <div className={styles.chatInputSection}>
                  <input
                    {...register("question", { required: true })}
                    type="text"
                    className={styles.chatInput}
                    placeholder={t("questionPlaceholder")}
                    autoComplete="off"
                    onKeyDown={handleKeyDown}
                    onInput={(e) => setIsEmpty(e.currentTarget.value === "")}
                    disabled={!isFirst}
                  />

                  {!isEmpty && (
                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={() => {
                        setValue("question", "");
                        setIsEmpty(true);
                      }}
                    >
                      <img src={ClearIcon} alt="clear" />
                    </button>
                  )}

                  {!streamDone ? (
                    <button
                      type="button"
                      className={styles.submitButton}
                      disabled={isSending}
                      onClick={() => {
                        handleSubmit((data) => {
                          onSubmit(data);
                          setIsStreamConnect(true);
                          dispatch(setIsStreamShow(true));
                          setIsEmpty(true);
                          dispatch(setIsStopQuestion(false));
                          dispatch(setStreamDone(true));
                        })();
                      }}
                    >
                      <img src={Send} alt="btn" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.stopButton}
                      disabled={isSending}
                      onClick={() => {
                        stopAvatarGeneration({ client_id: String(value.id) });
                        dispatch(setIsStopQuestion(true));
                        dispatch(setStreamDone(false));
                      }}
                    >
                      <div className={styles.beforeIcon} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <LanguageModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            languages={languages}
            defaultLanguage={defaultLanguage}
            onLanguageSelect={onLanguageSelect}
          />
          <MetaModal
            isModalOpen={isMetaModalOpen}
            setIsModalOpen={setIsMetaModalOpen}
            metaData={renderMetaData()}
          />
        </div>
      )}
    </>
  );
};

export default AskQuestionComponent;
