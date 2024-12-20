import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Collapse } from "antd";
import styles from "./AskQuestionComponent.module.scss";
import Send from "../../../../assets/images/icons/sendIcon.svg";
import ChatSpinner from "../../../../components/common/ChatSpinner";
import Button from "../../../../components/common/Buttons/Button";
// import { SrsPlayer } from "../../../../components/common/SrsPlayer";
import ChooseAvatar from "./common/ChooseAvatar/ChooseAvatar";
import ChooseAvatarStep2 from "./common/ChooseAvatarStep2/ChooseAvatarStep2";
import ChooseAvatarStep3 from "./common/ChooseAvatarStep3/ChooseAvatarStep3";
import ChooseAvatarStep4 from "./common/ChooseAvatarStep4/ChooseAvatarStep4";

type FormValues = {
  question: string;
};

type AskQuestionComponentProps = {
  setQuestion: (text: string) => void;
  clearMessages: () => void;
  messages: any;
  isLoading: boolean;
  title: string;
  metaData: any;
  avatars: any;
  setUserAvatar: (id: number) => void;
};

const { Panel } = Collapse;

const AskQuestionComponent: React.FC<AskQuestionComponentProps> = ({
  setQuestion,
  clearMessages,
  messages,
  title,
  isLoading,
  metaData,
  avatars,
  setUserAvatar,
}) => {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [messageClass, setMessageClass] = useState(styles.messageSystemChange);
  const [messageTime, setMessageTime] = useState<string>("");
  const [isCollapseVisible, setIsCollapseVisible] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // const videoRef = useRef<HTMLVideoElement | any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const currentTime = getCurrentTime();
    setQuestion(data.question);
    clearMessages();
    setUserMessage(data.question);
    setMessageClass(styles.messageSystem);
    setMessageTime(currentTime);
    setIsSending(true);
    reset();

    setTimeout(() => {
      setIsSending(false);
    }, 2000);
  };

  const renderMetaData = () => {
    if (metaData && metaData.length > 0) {
      return metaData.map((item: any, index: number) => (
        <Panel header={`Page ${item.meta.loc.pageNumber}`} key={index}>
          <div>
            <p>
              <strong>Location:</strong> Page {item.meta.loc.pageNumber}, Lines{" "}
              {item.meta.loc.lines.from}-{item.meta.loc.lines.to}
            </p>
            <p>
              <strong>Content Excerpt:</strong> {item.content.substring(0, 300)}
              ...
            </p>
          </div>
        </Panel>
      ));
    }
    return null;
  };

  const toggleCollapse = () => {
    setIsCollapseVisible(!isCollapseVisible);
  };

  return (
    <>
      {currentStep === 1 && (
        <ChooseAvatar
          avatars={avatars.result}
          setCurrentStep={setCurrentStep}
          setSelectedAvatar={setSelectedAvatar}
          setUserAvatar={setUserAvatar}
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
        <div className={styles.askQuestionPage}>
          <div className={styles.avatarSide}>
            <div className={styles.bookTitle}>{title}</div>
            <div
              className={styles.avatarFace}
              style={{ backgroundImage: `url(${selectedAvatar})` }}
            />
            {/*<SrsPlayer*/}
            {/*    url="https://avatars.plavno.app:1990/rtc/v1/whep/?app=live&stream=livestream"*/}
            {/*  // url="https://avatars.plavno.app:1990/rtc/v1/whep/?app=live&stream=livestream-a"*/}
            {/*  width={300}*/}
            {/*  height={100}*/}
            {/*  videoRef={videoRef}*/}
            {/*  options={{*/}
            {/*    autoPlay: true,*/}
            {/*    playsInline: true,*/}
            {/*    muted: false,*/}
            {/*    controls: true,*/}
            {/*  }}*/}
            {/*  rtcOpts={{*/}
            {/*    audio: {*/}
            {/*      enable: true,*/}
            {/*    },*/}
            {/*  }}*/}
            {/*/>*/}
            {metaData && metaData.length > 0 && !isLoading && !isSending && (
              <Button variant="Brown" onClick={toggleCollapse}>
                {isCollapseVisible ? "Hide details" : "Show details"}
              </Button>
            )}
            {isSending && <ChatSpinner />}
            {isCollapseVisible && <Collapse>{renderMetaData()}</Collapse>}
          </div>
          <div className={styles.chatContainer}>
            <div className={styles.chatContent}>
              {userMessage && (
                <div className={styles.messageUser}>
                  <div className={styles.userMessage}>
                    {userMessage}
                    <div className={styles.messageSystemBottom}>
                      <span className={styles.messageTime}>{messageTime}</span>
                    </div>
                  </div>
                </div>
              )}
              {messages && (
                <div className={messageClass}>
                  <div className={styles.messageSystemContent}>{messages}</div>
                </div>
              )}
            </div>
            {isLoading && (
              <div className={styles.spinnerContainer}>
                <ChatSpinner />
              </div>
            )}
            <form
              className={styles.chatInputSection}
              onSubmit={handleSubmit(onSubmit)}
            >
              <input
                {...register("question", { required: true })}
                type="text"
                className={styles.chatInput}
                placeholder="Your question..."
                autoComplete="off"
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSending}
              >
                <img src={Send} alt="btn" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AskQuestionComponent;
