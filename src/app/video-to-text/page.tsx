// share screen으로 유튜브 영상 내용 따서 자막 받기
"use client";

import axios from "axios";
import { useState } from "react";

export default function VideoToText() {
  const [text, setText] = useState<string>("");
  const [time, setTime] = useState<number>();
  const [stopBtnDisabled, setStopBtnDisabled] = useState<boolean>(true);
  const [ishidden, setIsHidden] = useState<boolean>(true);
  const [audioUrl, setAudioUrl] = useState<any>();

  let mediaRecorder: any;
  let audioChunks: any[] = [];

  const shareScreenHandler = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // 오디오 공유 활성화
      });
      // 비디오 트랙을 사용하지 않으므로 비활성화
      mediaStream.getVideoTracks().forEach((track) => track.stop());

      mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorder.start();

      mediaRecorder.ondataavailable = (event: any) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = [];
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setIsHidden(false);

        const formData = new FormData();
        formData.append("file", audioBlob, "screen_audio.webm");
        const res = await axios.post(
          "http://192.168.0.5:8000/transcribe/",
          formData
        );
        console.log(res);
        setText(res.data.text);
        setTime(res.data.execution_time_seconds);
      };

      setStopBtnDisabled(false);
    } catch (error) {
      console.error("Error sharing screen or recording:", error);
    }
  };

  const stopRecordHandler = () => {
    mediaRecorder.stop();
    setStopBtnDisabled(true);
  };

  return (
    <div className=" fixed left-1/2 top-1/2 flex flex-col translate-x-[-50%] translate-y-[-50%] border-2 px-[20px] py-[30px]">
      <h1>Share Screen and Transcribe Audio</h1>
      <button className="border-2" onClick={shareScreenHandler}>
        Share Screen and Start Recording
      </button>
      <button
        className="border-2 mb-[30px]"
        disabled={stopBtnDisabled}
        onClick={stopRecordHandler}
      >
        Stop Recording
      </button>
      <h2>Playback</h2>
      <audio src={audioUrl} controls hidden={ishidden}></audio>
      <h2>Transcription Result:</h2>
      <p className="border-2 p-[10px] h-[300px] mb-[30px]">{text}</p>
      <h2>Time:</h2>
      <p>{time}</p>
    </div>
  );
}
