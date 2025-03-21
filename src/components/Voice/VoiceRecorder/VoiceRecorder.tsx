import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
// import { Mic } from "lucide-react";
import RecordPlugin from "wavesurfer.js/dist/plugins/record";
import MicIcon from "../../../assets/images/icons/Mic.svg";

// import { useNotification } from '@refinedev/core';
import { Spin, Tooltip } from "antd";
import classNames from "classnames";

// import { CUSTOM_BUTTONS_TYPES, CustomButton } from '@components/Button';
// import {
//   renderLangCodes,
// } from '@helper';
// import SpinMic from '@components/SpinMic';

import styles from "./styles.module.scss";
import { renderLangCodes } from "../../../helpers/helper";
import { useVoice } from "../../../hooks/useVoice";
import { CustomButton } from "../Button";
import SpinMic from "../SpinMic";
import CustomIcon, { ICON_TYPES } from "../CustomIcon";
import Button from "../../common/Buttons/Button";
import { useTranslation } from "react-i18next";
// import {setIsStopQuestion} from "../../../modules/Home/slices/home";
// import {useDispatch} from "react-redux";

interface IVoiceRecorder {
  isNonHealth?: boolean;
  addTextWithDelay: (values: string) => void;
  selectedLanguage: string;
  setIsRecordingInProcess: (isInProcess: boolean) => void;
  clickCursor: () => void;
  isLoadingData?: boolean;
  link: string;
  setFormData: (formData: any) => void;
  setQuestion: (text: string) => void;
  setIsStreamConnect?: (value: boolean) => void;
  userId: any;
  selectedLanguageCode: string;
  isFirst: boolean;
  setIsFirst: (value: boolean) => void;
  indexName: string;
  setIsShowSilent: any;
  setChatHistory: any;
  setMessageClass: any;
  streamDone: any;
}

const VoiceRecorder: React.FC<IVoiceRecorder> = ({
  isLoadingData,
  clickCursor,
  addTextWithDelay,
  isNonHealth,
  selectedLanguage,
  setIsRecordingInProcess,
  setFormData,
  setQuestion,
  link,
  setIsStreamConnect,
  userId,
  indexName,
  selectedLanguageCode,
  setIsShowSilent,
  setIsFirst,
  isFirst,
  setChatHistory,
  setMessageClass,
  streamDone,
}) => {
  // const { open } = useNotification();

  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recordingUrl] = useState<string | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const recordRef = useRef<any>(null);
  const progressRef = useRef<HTMLParagraphElement>(null);

  const [isConnecting, setIsConnecting] = useState(false);

  const [isReadyPaused, setIsReadyPaused] = useState(false);

  const language = renderLangCodes(selectedLanguage);

  const [
    stopStreaming,
    startStreaming,
    deleteStreaming,
    connectToWhisper,
    pauseStreaming,
  ] = useVoice({
    language,
    setTextAreaValue: addTextWithDelay,
    paused,
    setIsRecordingInProcess,
    // setQuestion,
    userId,
    indexName,
    selectedLanguageCode,
    setIsShowSilent,
    setChatHistory,
    setMessageClass,
  });

  console.log(deleteStreaming, pauseStreaming);

  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<
    boolean | null
  >(null);

  // const dispatch = useDispatch();

  // Function to check microphone access
  const checkMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophoneAccess(true);
      // You may want to stop the stream immediately if you're only checking for permissions
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      setHasMicrophoneAccess(false);
    }
  };
  console.log("isFirst", isFirst);
  useEffect(() => {
    checkMicrophoneAccess();
  }, []);

  useEffect(() => {
    if (link) {
      createRecordedWaveSurfer(link, "#playBtn", true);
    }
  }, [isLoadingData, hasMicrophoneAccess]);

  const createWaveSurfer = () => {
    // if (!hasMicrophoneAccess) {
    //   open && open({
    //     message: 'Please enable it in your browser settings',
    //     type: 'error',
    //     description: 'Microphone access denied',
    //   });
    //
    //   return;
    // }

    // Destroy existing instance if any
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    if (recordingUrl) {
      return;
    }

    clickCursor();

    wavesurferRef.current = WaveSurfer.create({
      container: "#mic",
      waveColor: "white",
      progressColor: "white",
      height: 24,
      width: isNonHealth ? "850px" : "220px",
      barGap: 1,
      barWidth: 1.5,
      barHeight: 15,
    });

    recordRef.current = wavesurferRef.current.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
      })
    );

    recordRef.current.on("record-progress", (time: number) => {
      updateProgress(time);
    });

    handleRecordClick();
  };

  const createRecordedWaveSurfer = (
    url: string,
    id: string,
    isReadyAudio = false
  ) => {
    if (!hasMicrophoneAccess) {
      return;
    }

    const container = document.querySelector("#recordings");
    const newWaveSurfer = WaveSurfer.create({
      container: container! as any,
      waveColor: "rgba(199, 204, 205, 0.6)",
      progressColor: "rgba(199, 204, 205, 0.6)",
      height: 24,
      width: isNonHealth ? "860px" : "220px",
      barGap: 1,
      barWidth: 1.5,
      barHeight: 15,
      url,
    });

    if (isReadyAudio) {
      newWaveSurfer.load(url);
    }

    const button = document.getElementById(id);

    if (!button) {
      return;
    }

    button.onclick = () => newWaveSurfer.playPause();

    newWaveSurfer.on("finish", () => setIsReadyPaused(false));
  };

  const updateProgress = (time: number) => {
    if (!progressRef.current) {
      return;
    }

    const formattedTime = [
      Math.floor((time % 3600000) / 60000),
      Math.floor((time % 60000) / 1000),
    ]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");
    progressRef.current.textContent = formattedTime;
  };

  const renderText = () => {
    if (recordingUrl) {
      return "Recording is ready!";
    }

    if (!isFirst && paused) {
      return "Paused";
    }

    if (!isFirst && !paused) {
      return t("askNow");
    }
  };

  const handleRecordClick = async () => {
    if (!hasMicrophoneAccess) {
      return;
    }

    if (recording || paused) {
      recordRef.current?.stopRecording();
      setRecording(false);
      setPaused(false);
      stopStreaming();
      setIsFirst(true);
      // dispatch(setIsStopQuestion(true));
      // setIsStreamConnect && setIsStreamConnect(false); // Stop stream connection when recording stops
      return;
    }

    setRecording(true);
    setIsStreamConnect && setIsStreamConnect(true); // Start stream connection
    await recordRef.current?.startRecording();
  };

  useEffect(() => {
    if (!isConnecting) {
      return;
    }

    connectToWhisper();

    setTimeout(async () => {
      setIsFirst(false);
      startStreaming();
      setIsConnecting(false);
    }, 3000);
  }, [isConnecting]);

  useEffect(() => {
    if (isFirst) {
      return;
    }

    createWaveSurfer();
  }, [isFirst]);

  if (isLoadingData) {
    return (
      <div className={styles.wrapper}>
        <Spin />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.playBtnForReadyAudio}>
        <CustomButton
          onClick={() => {
            setIsReadyPaused(!isReadyPaused);
          }}
          className={!link ? styles.hiddenPlayBtn : styles.playBtn}
          title=""
          id={"#playBtn"}
          icon={
            isReadyPaused ? (
              <CustomIcon type={ICON_TYPES.PAUSE_RECORD} />
            ) : (
              <CustomIcon type={ICON_TYPES.START_RECORD} />
            )
          }
        />
      </div>

      {link ? (
        <div className={styles.blockForReadyAudio}>
          <div className={styles.voiceBlock}>
            <p className={styles.name}>Your Recording </p>
            <div
              className={styles.recordingForReadyAudio}
              id="recordings"
            ></div>{" "}
          </div>
        </div>
      ) : isFirst ? (
        <div className={styles.initialBlock}>
          <div className={styles.btnMic}>
            <Button
              variant="Brown"
              disabled={streamDone}
              style={{
                marginBottom: 0,
                minHeight: 88,
                marginTop: 0,
                width: "100%",
                justifyContent: "space-between",
                background:
                  "linear-gradient(to bottom, #d3a171, #c18a5b, #a66744)",
                borderRadius: "16px",
              }}
              onClick={() => {
                setIsConnecting(true);
              }}
            >
              <span>{t("talkToAvatar")}</span>

              <div className={styles.startRecording}>
                <div
                  className={classNames(
                    styles.stopBtnIconWrapper,
                    !paused && styles.stopBtnIconWrapperPaused
                  )}
                >
                  {isConnecting ? (
                    <SpinMic />
                  ) : (
                    <img style={{ margin: 0 }} src={MicIcon} alt="" />
                  )}
                </div>
              </div>
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.voiceBlock}>
          <span className={styles.name}>{renderText()}</span>
          {!recordingUrl && (
            <>
              <div className={styles.readyRecordingWrapper}>
                <div id="mic" className={styles.stopBtn}></div>
              </div>
              <div style={{ display: "flex" }}>
                <Tooltip title={t("stop")} placement="top">
                  <div>
                    <div
                      className={styles.stopRecording}
                      onClick={handleRecordClick}
                    >
                      <div
                        className={classNames(
                          styles.stopBtnIconWrapper,
                          !paused && styles.stopBtnIconWrapperPaused
                        )}
                      >
                        <div className={styles.StopIcon} />
                      </div>
                      {recording ? (
                        <span
                          style={{ color: "white" }}
                          className={styles.progressBlock}
                          id="progress"
                          ref={progressRef}
                        >
                          00:00
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </Tooltip>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default VoiceRecorder;
