import { useEffect, useRef, useState } from "react";
import { float32ArrayToBase64, resampleTo16kHZ } from "../helpers/helper";
import { urlSocket } from "../envConstants";
import { useDispatch } from "react-redux";
import { setIsStreamShow } from "../modules/Home/slices/home";
import styles from "../modules/Home/components/AskQuestionComponent/AskQuestionComponent.module.scss";

interface IUseVoiceHook {
  language?: string;
  setTextAreaValue: (values: string) => void;
  paused?: boolean;
  isTrascribe?: boolean;
  setIsRecordingInProcess?: (isRecordingInProcess: boolean) => void;
  userId: string;
  indexName: string;
  selectedLanguageCode: string;
  setIsShowSilent: any;
  setChatHistory?: any;
  setMessageClass: any;
}

export const useVoice = ({
  language = "en",
  setTextAreaValue,
  setIsRecordingInProcess,
  isTrascribe = false,
  userId,
  indexName,
  selectedLanguageCode,
  setIsShowSilent,
  setChatHistory,
  setMessageClass,
}: IUseVoiceHook) => {
  const socketRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dispatch = useDispatch();

  const [userLanguage, setUserLanguage] = useState("en");
  const [state, setState] = useState(0);
  const stateRef = useRef(state);
  console.log(userLanguage);

  useEffect(() => {
    if (navigator) {
      setUserLanguage(navigator.language?.split("-")?.[0]);
    }
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [messages, setMessages] = useState<string[]>([]);
  // const [chatHistory, setChatHistory] = useState<any>([]);
  console.log("messages", messages);

  let questionTexts = [];
  let timeoutId: any = null;
  let lastQuestionText = "";

  // console.log("chatHistory", chatHistory)

  const connectToWhisper = () => {
    socketRef.current = new WebSocket(urlSocket);

    socketRef.current.onopen = () => {
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        console.log("selectedLanguageCode", selectedLanguageCode, userId);
        socketRef.current?.send(
          JSON.stringify({
            uid: userId,
            language: selectedLanguageCode,
            task: "transcribe",
            model: "large-v3",
            use_vad: true,
          })
        );
      }
    };

    socketRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("[WebSocket Response]", data);

      if (data?.type === "question" && data?.segments) {
        // Get the last segment of the question
        const lastSegment = data.segments[data.segments.length - 1];
        const questionText = lastSegment?.text || "";

        questionTexts.push(questionText);
        lastQuestionText = questionText;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          if (lastQuestionText) {
            setChatHistory((prev: any) => [
              ...prev,
              {
                type: "user",
                message: lastQuestionText,
                timestamp: new Date().toLocaleTimeString(),
              },
              {
                type: "response",
                message: " ",
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
            questionTexts = [];
          }
        }, 1000);
      }
      setMessageClass(styles.messageSystem);

      if (data?.type === "answer" && data?.text) {
        const chunkText = data.text;

        // Add the chunk to messages
        setMessages((prev) => [...prev, chunkText]);

        setChatHistory((prev: any) => {
          const updatedHistory = [...prev];
          const lastIndex = updatedHistory.length - 1;

          if (updatedHistory[lastIndex]?.type === "response") {
            updatedHistory[lastIndex].message += chunkText;
          } else {
            updatedHistory.push({ type: "response", message: chunkText });
          }

          return updatedHistory;
        });

        // setTextAreaValue((prev) => prev + chunkText);
        dispatch(setIsStreamShow(true));
      }
    };
  };

  const requestUserMediaAudioStream = async (config: MediaTrackConstraints) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...config,
        noiseSuppression: true,
        echoCancellation: true,
        channelCount: 1,
      },
    });
    return stream;
  };

  const getRecorder = (stream: MediaStream) => {
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const mediaStream = audioCtx.createMediaStreamSource(stream);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 1.5;
    // 1. Low-pass filter (удаляет высокочастотные шумы)
    const lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = "lowpass";
    lowPassFilter.frequency.setValueAtTime(2000, audioCtx.currentTime); // было 3000

    // 2. High-pass filter (удаляет низкочастотные шумы)
    const highPassFilter = audioCtx.createBiquadFilter();
    highPassFilter.type = "highpass";
    highPassFilter.frequency.setValueAtTime(150, audioCtx.currentTime); // было 85

    // 3. Notch (band-stop) filter на 50/60 Гц (электрические шумы)
    const notchFilter = audioCtx.createBiquadFilter();
    notchFilter.type = "notch";
    notchFilter.frequency.setValueAtTime(50, audioCtx.currentTime);
    notchFilter.Q.setValueAtTime(10, audioCtx.currentTime); // Узкий диапазон подавления

    const recorder = audioCtx.createScriptProcessor(8192, 1, 1);

    recorder.onaudioprocess = (event) => {
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        const inputData = event.inputBuffer.getChannelData(0);

        // Проверяем громкость сигнала (если RMS < порога — не отправляем)
        const rms = Math.sqrt(
          inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length
        );
        if (rms < 0.01) return; // Порог чувствительности, подбери нужное значение

        const audioData16kHz = resampleTo16kHZ(inputData, audioCtx.sampleRate);
        const packet = {
          speakerLang: selectedLanguageCode,
          index: indexName,
          audio: float32ArrayToBase64(audioData16kHz),
        };

        socketRef.current?.send(JSON.stringify(packet));
      }
    };

    // Подключаем фильтры в цепочку
    mediaStream.connect(lowPassFilter);
    lowPassFilter.connect(highPassFilter);
    highPassFilter.connect(notchFilter);
    notchFilter.connect(recorder);
    gainNode.connect(recorder);
    recorder.connect(audioCtx.destination);

    recorderRef.current = recorder;
  };
  const startStreaming = async () => {
    setIsRecordingInProcess && setIsRecordingInProcess(true);

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const audioContext = audioCtxRef.current;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    try {
      const stream = await requestUserMediaAudioStream({
        noiseSuppression: true,
        echoCancellation: true,
      });
      streamRef.current = stream;
      getRecorder(stream);
    } catch (e) {
      console.error("[startStreaming] media stream request failed:", e);
    }
  };

  const pauseStreaming = async () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;

      if (audioCtxRef.current) {
        await audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } else {
      startStreaming();
    }
  };

  const stopStreaming = () => {
    setIsRecordingInProcess && setIsRecordingInProcess(false);

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }

    // if (recorderRef.current) {
    //   recorderRef.current.disconnect();
    //   recorderRef.current = null;
    // }

    // if (audioCtxRef.current) {
    //   audioCtxRef.current.close();
    //   audioCtxRef.current = null;
    // }
    //
    // if (socketRef.current) {
    //   socketRef.current.close();
    //   socketRef.current = null;
    // }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (streamRef.current)
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      if (recorderRef.current) recorderRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const deleteStreaming = () => {
    socketRef.current = null;
    audioCtxRef.current = null;
    recorderRef.current = null;
    streamRef.current = null;
    stateRef.current = 0;
    setState(0);
  };

  return [
    stopStreaming,
    startStreaming,
    deleteStreaming,
    connectToWhisper,
    pauseStreaming,
  ];
};
