import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Collapse } from "antd"; // Import Collapse from Ant Design
import styles from "./AskQuestionComponent.module.scss";
import Avatar from "../../../../assets/images/tempAvatar.png";
import Send from "../../../../assets/images/icons/sendIcon.svg";
import ChatSpinner from "../../../../components/common/ChatSpinner";
import Button from "../../../../components/common/Buttons/Button";

type FormValues = {
  question: string;
};

type AskQuestionComponentProps = {
  setQuestion: (text: string) => void;
  clearMessages: () => void; // Новый проп
  messages: any; // Предполагаем, что messages — строка
  isLoading: boolean;
  title: string;
  metaData: any;
};

const { Panel } = Collapse; // For Collapse component

const AskQuestionComponent: React.FC<AskQuestionComponentProps> = ({
  setQuestion,
  clearMessages,
  messages,
  title,
  isLoading,
  metaData,
}) => {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [messageClass, setMessageClass] = useState(styles.messageSystemChange);
  const [messageTime, setMessageTime] = useState<string>("");
  const [isCollapseVisible, setIsCollapseVisible] = useState(false); // State to toggle Collapse visibility
  const [isSending, setIsSending] = useState(false); // State to manage sending status

  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const currentTime = getCurrentTime();
    setQuestion(data.question);
    clearMessages(); // Очистка messages
    setUserMessage(data.question);
    setMessageClass(styles.messageSystem);
    setMessageTime(currentTime);
    setIsSending(true);
    reset();

    // Simulate the sending process
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
    <div className={styles.askQuestionPage}>
      <div className={styles.avatarSide}>
        <div className={styles.bookTitle}>{title}</div>
        <img src={Avatar} alt="avatar" />
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
  );
};

export default AskQuestionComponent;
