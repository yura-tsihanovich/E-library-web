import { useEffect, useRef, useState } from "react";
import { float32ArrayToBase64, resampleTo16kHZ } from "../helpers/helper";
import { urlSocket } from "../envConstants";
import { useDispatch } from "react-redux";
import { setIsStreamShow } from "../modules/Home/slices/home";

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

      if (data?.segments) {
        if (!isTrascribe) {
          const resultText = data.segments.map((item: any) => item.text || "");
          const res = resultText?.[stateRef.current];

          if (res) {
            setState((prevState) => {
              const newState = prevState + 1;
              stateRef.current = newState;
              return newState;
            });
            setTextAreaValue(res);
            dispatch(setIsStreamShow(true));
          }
          return;
        }

        const resultText = data.segments
          .map((item: any) => item.text || "")
          .join(" ");

        setTextAreaValue(resultText);
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

    // Low-pass filter (reduces high-frequency noise)
    const lowPassFilter = audioCtx.createBiquadFilter();
    lowPassFilter.type = "lowpass";
    lowPassFilter.frequency.setValueAtTime(3000, audioCtx.currentTime);

    // High-pass filter (reduces low-frequency noise)
    const highPassFilter = audioCtx.createBiquadFilter();
    highPassFilter.type = "highpass";
    highPassFilter.frequency.setValueAtTime(85, audioCtx.currentTime);

    const recorder = audioCtx.createScriptProcessor(8192, 1, 1);

    recorder.onaudioprocess = (event) => {
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        const inputData = event.inputBuffer.getChannelData(0);
        const audioData16kHz = resampleTo16kHZ(inputData, audioCtx.sampleRate);

        const packet = {
          speakerLang: selectedLanguageCode,
          index: indexName,
          audio: float32ArrayToBase64(audioData16kHz),
        };

        socketRef.current?.send(JSON.stringify(packet));
      }
    };

    // Connect filters
    mediaStream.connect(lowPassFilter);
    lowPassFilter.connect(highPassFilter);
    highPassFilter.connect(recorder);
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

    if (recorderRef.current) {
      recorderRef.current.disconnect();
      recorderRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
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
