import { AskQuestionComponent } from "../components";
import { useEffect, useRef, useState } from "react";
import { EventSourceMessage } from "@microsoft/fetch-event-source";
import { useParams } from "react-router-dom";
import {
  clearBooks,
  getAvatars,
  getBookById,
  setAvatarStreamShow,
  setIsStreamShow,
  setStreamDone,
} from "../slices/home";
import { useDispatch } from "react-redux";
import { useLazySelector } from "../../../hooks";
import {
  getLanguages,
  // getMe,
  setAvatar,
  useAuthState,
} from "../../Auth/slices/auth";
import { useSocket } from "../../../hooks/useSocket";
import TokenManager from "../../../utils/TokenManager";
import { useQuery } from "../../../hooks/useQuery";
import { v4 as uuidv4 } from "uuid";
import { Form } from "antd";
import { vectorsAsk } from "../api/homeService";
import { eventSourceMessageEventTypeActions } from "../../../helpers/sseSourceMessageEventActions";
import { stopAvatarGeneration } from "../../../helpers/stopAvatarGeneration";
import { SrsRtcWhipWhepAsync } from "../../../components/common/SrsPlayer/srs/srs.sdk";
import { TypeOnMetaEvents } from "../slices/home/types";

export type Chat = {
  type: "user" | "response";
  message: string;
};
type SendMessageType = {
  query: string;
};

export interface TypeOnErrorEvent {
  response: {
    message: string;
    error: string;
    statusCode: number;
  };
  status: number;
  options: Record<string, unknown>;
  message: string;
  name: string;
}

class RetriableError extends Error {}

const AskQuestionContainer: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [meta, setMeta] = useState<TypeOnMetaEvents[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  // const history = useHistory();
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const selectedBookIdQuery = useQuery("selectedBook");

  const [form] = Form.useForm();
  const { userData } = useAuthState();
  const token = TokenManager.getAccessToken();
  const ctrlRef = useRef<AbortController>(new AbortController());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const srsSdkRef = useRef<typeof SrsRtcWhipWhepAsync | any>(null);
  const selectedBookId = useQuery("selectedBook");

  useEffect(() => {
    if (!id) return; // Если id нет — выходим
    dispatch(getBookById(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getLanguages());
  }, [dispatch]);

  const { currentBook, avatars, avatarLanguage, avatarStreamShow } =
    useLazySelector(({ home }) => {
      const {
        currentBook,
        avatars,
        avatarLanguage,
        avatarStreamShow,
        isStopQuestion,
      } = home;
      return {
        currentBook,
        avatars,
        avatarLanguage,
        avatarStreamShow,
        isStopQuestion,
      };
    });

  const { languages } = useLazySelector(({ auth }) => {
    const { languages } = auth;
    return { languages };
  });

  useEffect(() => {
    setAvatarStreamShow(false);
    dispatch(clearBooks());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAvatars({
        limit: "12",
        page: "1",
      })
    );
  }, [dispatch]);

  const setUserAvatar = () => {
    dispatch(
      setAvatar({
        avatarSettings: {
          // id: avatarId,
          id: 3,
        },
      })
    );
  };

  const onOpenEvent = async () => {
    setChatHistory((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: "response",
        message: "",
      },
    ]);
  };

  const onMessage = (data: { chunk: string }) => {
    setChatHistory((prevState: any) => {
      const newState = [...prevState];

      newState[newState.length - 1] = {
        ...newState[newState.length - 1],
        message: newState[newState.length - 1].message + data.chunk,
        type: "response",
      };

      return newState;
    });
  };

  const onMeta = (data: TypeOnMetaEvents[]) => {
    setMeta(data);
  };

  const onDone = () => {
    ctrlRef.current.abort();
    setIsLoading(false);
    setChatHistory((prevState: any) => {
      const newState = [...prevState];

      delete newState[newState.length - 1].status;

      return newState;
    });
  };

  const onError = (data: TypeOnErrorEvent) => {
    setChatHistory((prevState: any) => {
      const newState = [...prevState];

      newState[newState.length - 1] = {
        ...newState[newState.length - 1],
        message:
          newState[newState.length - 1].message + data?.response?.message,
        type: "response",
      };

      return newState;
    });
  };

  const onErrorEvent = (err: any) => {
    if (err) {
      ctrlRef.current.abort();
      setIsLoading(false);
      throw new RetriableError();
    }
  };

  const callSSE = async (query: string) => {
    const indexName =
      selectedBookIdQuery === "global"
        ? "GlobalLibraryCollection"
        : currentBook?.result?.vectorEntity?.indexName;

    const reqBody = {
      query,
      indexName: indexName || "GlobalLibraryCollection",
      language: { id: avatarLanguage?.id || 7 },
    };

    const onMessageEvent = ({ data, event }: EventSourceMessage) => {
      eventSourceMessageEventTypeActions({
        event,
        data,
        onMessage,
        onMeta,
        onDone,
        onError,
      });
    };

    await vectorsAsk({
      body: reqBody as unknown as BodyInit | null | undefined,
      signal: ctrlRef.current.signal,
      onopen: onOpenEvent,
      onmessage: onMessageEvent,
      onerror: onErrorEvent,
    });
  };

  const sendMessageToVector = async ({ query }: SendMessageType) => {
    if (!query) {
      return;
    }

    try {
      setIsLoading(true);
      setChatHistory((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "user",
          message: query,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      form.resetFields();
      if (userData.result.id && avatarStreamShow) {
        stopAvatarGeneration(
          { client_id: userData.result.id.toString() },
          token
        ).then(() => callSSE(query));
      } else {
        await callSSE(query);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setIsStreamShow(false));
    };
  }, [dispatch]);

  const clearMessages = () => {
    setMessages([]);
  };

  const { connected, subscribeToEvent, unsubscribeFromEvent } = useSocket({
    url: "https://elib.plavno.io:8080/srs",
    getAuthToken: async () => {
      const token = TokenManager.getAccessToken();
      return token ?? "";
    },
  });

  useEffect(() => {
    if (!connected) return;
    const handlePublishStream = () => {
      console.log("Stream started");
      dispatch(setAvatarStreamShow(true));
    };

    const handleUnpublishStream = () => {
      console.log("Stream ended");
      dispatch(setAvatarStreamShow(false));
      dispatch(setStreamDone(false));
    };

    subscribeToEvent("publish-stream", handlePublishStream);
    subscribeToEvent("unpublish-stream", handleUnpublishStream);

    return () => {
      unsubscribeFromEvent("publish-stream");
      unsubscribeFromEvent("unpublish-stream");
    };
  }, [subscribeToEvent, unsubscribeFromEvent, connected, avatarStreamShow]);

  useEffect(() => {
    if (selectedBookId && selectedBookId !== "global") {
      dispatch(getBookById(selectedBookId));
    }
    return () => {
      setChatHistory([]);
      stopAvatarGeneration(
        { client_id: userData?.result?.id?.toString() },
        token
      );
    };
  }, [selectedBookId]);

  return (
    <AskQuestionComponent
      clearMessages={clearMessages}
      messages={messages}
      isLoading={isLoading}
      title={currentBook?.result?.title}
      metaData={meta}
      avatars={avatars}
      setUserAvatar={setUserAvatar}
      chatHistory={chatHistory}
      setChatHistory={setChatHistory}
      languages={languages?.result?.data}
      indexName={currentBook?.result?.vectorEntity?.indexName}
      form={form}
      submitMessage={sendMessageToVector}
      videoRef={videoRef}
      srsSdkRef={srsSdkRef}
      unsubscribeFromEvent={unsubscribeFromEvent}
    />
  );
};

export default AskQuestionContainer;
