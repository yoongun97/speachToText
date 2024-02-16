// 직접 녹음해서 자막 받기
"use client";

import axios from "axios";
import { useCallback, useState } from "react";

export default function RecordToText() {
  const [text, setText] = useState<string>("");
  const [time, setTime] = useState<number>();

  const uploadFile = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    if (audioUrl) {
      formData.append("file", audioUrl);
    }

    try {
      const res = await axios.post(
        "http://192.168.0.5:8000/transcribe/",
        formData
      );
      console.log(res);
      setText(res.data.text);
      setTime(res.data.execution_time_seconds);
    } catch (error) {
      console.error(error);
    }
  };
  // --------------------------------------------------------------------
  const [stream, setStream] = useState<any>();
  const [media, setMedia] = useState<any>();
  const [onRec, setOnRec] = useState<boolean>(true);
  const [source, setSource] = useState<any>();
  const [analyser, setAnalyser] = useState<any>();
  const [audioUrl, setAudioUrl] = useState<any>();
  const chunks = []; // 오디오 청크 데이터를 저장할 배열

  const onRecAudio = () => {
    setText("");
    setTime(0);
    // 음원정보를 담은 노드를 생성하거나 음원을 실행또는 디코딩 시키는 일을 한다
    const audioCtx = new window.AudioContext();

    // 자바스크립트를 통해 음원의 진행상태에 직접접근에 사용된다.
    const analyser = audioCtx.createScriptProcessor(0, 1, 1);
    setAnalyser(analyser);

    function makeSound(stream: any) {
      // 내 컴퓨터의 마이크나 다른 소스를 통해 발생한 오디오 스트림의 정보를 보여준다.
      const source = audioCtx.createMediaStreamSource(stream);
      setSource(source);

      // AudioBufferSourceNode 연결
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    // 마이크 사용 권한 획득 후 녹음 시작
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);

        // dataavailable 이벤트 핸들러 등록
        mediaRecorder.addEventListener("dataavailable", (e) => {
          chunks.push(e.data); // 청크 데이터를 배열에 추가
        });

        mediaRecorder.start();
        setStream(stream);
        setMedia(mediaRecorder);
        makeSound(stream);
        // 음성 녹음이 시작됐을 때 onRec state값을 false로 변경
        analyser.onaudioprocess = function (e) {
          setOnRec(false);
        };
      })
      .catch((error) => {
        // 마이크 사용 권한을 받지 못했을 때 처리
        alert("마이크 사용 권한을 허용해야 녹음을 진행할 수 있습니다.");
      });
  };

  //------------------------------------------------------------------------------------
  const offRecAudio = () => {
    // dataavailable 이벤트로 Blob 데이터에 대한 응답을 받을 수 있음
    media.ondataavailable = function (e: any) {
      chunks.push(e.data);
      setAudioUrl(e.data);
      setOnRec(true);
    };

    // 모든 트랙에서 stop()을 호출해 오디오 스트림을 정지
    stream.getAudioTracks().forEach(function (track: any) {
      track.stop();
    });

    // 미디어 캡처 중지
    media.stop();

    // 메서드가 호출 된 노드 연결 해제
    analyser.disconnect();
    source.disconnect();
  };

  //--------------------------------------------------------------------------------------------
  const onSubmitAudioFile = useCallback(() => {
    if (audioUrl) {
      const audio = new Audio(URL.createObjectURL(audioUrl));
      audio.play();
    }
  }, [audioUrl]);

  return (
    <div className="w-[500px] h-[500px] fixed left-1/2 top-1/2 flex flex-col translate-x-[-50%] translate-y-[-50%] border-2 px-[20px]">
      <div className="flex justify-between  my-[30px]">
        <button
          className={onRec ? "border-2" : "border-2 bg-[#FFA500]"}
          onClick={onRec ? onRecAudio : offRecAudio}
        >
          {onRec ? "녹음 시작" : "녹음 중지"}
        </button>
        <button className="border-2" onClick={onSubmitAudioFile}>
          결과 확인
        </button>
        <button className="border-2" onClick={uploadFile}>
          upload
        </button>
      </div>
      <div>
        <div className="border-2 p-[10px] h-[300px] mb-[30px]">{text}</div>
        <div>time: {time}</div>
      </div>
    </div>
  );
}
