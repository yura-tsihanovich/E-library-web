import { useEffect, useRef, useState } from "react";

// import { float32ArrayToBase64, resampleTo16kHZ } from '@helper';
// import { urlSocket } from 'src/envConstants';
import { float32ArrayToBase64, resampleTo16kHZ } from "../helpers/helper";
import { urlSocket } from "../envConstants";

interface IUseVoiceHook {
  language?: string;
  setTextAreaValue: (values: string) => void;
  paused?: boolean;
  isTrascribe?: boolean;
  setIsRecordingInProcess?: (IsRecordingInProcess: boolean) => void;
}

export const useVoice = ({
  language = "en",
  setTextAreaValue,
  setIsRecordingInProcess,
  isTrascribe = false,
}: IUseVoiceHook) => {
  const socketRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [userLanguage, setUserLanguage] = useState("en");

  useEffect(() => {
    if (navigator) {
      setUserLanguage(navigator.language?.split("-")?.[0]);
    }
  }, []);

  const [state, setState] = useState(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const connectToWhisper = () => {
    socketRef.current = new WebSocket(urlSocket);
    socketRef.current.onopen = () => {
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        socketRef.current?.send(
          JSON.stringify({
            uid: "tester",
            language: userLanguage,
            task: "transcribe",
            model: "large-v3",
            use_vad: true,
          })
          // JSON.stringify({
          //   uid: 'tester',
          // }),
        );
      }
    };

    socketRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data) {
        if (!isTrascribe) {
          const resultText = data?.segments?.map((item: any) => {
            if (item.translate?.[`${language}`]) {
              return `${item.translate?.[`${language}`]?.trim()} `;
            }
          });
          const res = resultText?.[stateRef?.current];

          if (res) {
            setState((prevState) => {
              const newState = prevState + 1;
              stateRef.current = newState;

              return newState;
            });
            setTextAreaValue(res);
          }

          return;
        }

        const resultText = data?.segments
          ?.map((item: any) => {
            if (item.translate?.[`${language}`]) {
              return `${item.translate?.[`${language}`]?.trim()} `;
            }
          })
          .join(" ");
        // const resultText = data?.segments?.map((item: any) => item.text).join('\n');

        setTextAreaValue(resultText);
      }
    };
  };

  const requestUserMediaAudioStream = async (config: MediaTrackConstraints) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { ...config, channelCount: 1 },
    });

    return stream;
  };
  const getRecorder = (stream: MediaStream) => {
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const mediaStream = audioCtx.createMediaStreamSource(stream);
    const recorder = audioCtx.createScriptProcessor(8192, 1, 1);

    recorder.onaudioprocess = (event) => {
      if (socketRef?.current?.readyState === WebSocket.OPEN) {
        const inputData = event.inputBuffer.getChannelData(0);
        const audioData16kHz = resampleTo16kHZ(inputData, audioCtx.sampleRate);

        const packet = {
          speakerLang: userLanguage,
          allLangs: [language],
          audio: float32ArrayToBase64(audioData16kHz),
        };

        const jsonPacket = JSON.stringify(packet);
        socketRef.current?.send(jsonPacket);
      }
    };

    mediaStream.connect(recorder);
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
        noiseSuppression: false,
        echoCancellation: false,
      });
      streamRef.current = stream;
      getRecorder(stream);
      // setIsRecording(true);
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
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
      }
    } else {
      startStreaming();
    }
  };

  const stopStreaming = () => {
    setIsRecordingInProcess && setIsRecordingInProcess(false);

    // Stop all tracks in the media stream
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }

    // Disconnect the audio context and recorder
    if (recorderRef.current) {
      recorderRef.current.disconnect();
      recorderRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    }

    // Close the WebSocket connection
    if (socketRef.current) {
      // const encoder = new TextEncoder();
      // const endSignal = encoder.encode('END_OF_AUDIO');
      // socketRef.current?.send(endSignal);

      socketRef.current?.close();

      socketRef.current = null;
    }
  };
  useEffect(
    () => () => {
      if (socketRef.current) {
        socketRef.current?.close();
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }

      if (recorderRef.current) {
        recorderRef.current.disconnect();
      }

      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    },
    []
  );

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