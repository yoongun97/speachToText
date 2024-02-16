// 오디오 파일 업로드해서 자막 받기
"use client";

import axios from "axios";
import { useState } from "react";

export default function AudioToText() {
  const [file, setFile] = useState<string | Blob>();
  const [text, setText] = useState<string>("");
  const [time, setTime] = useState<number>();

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
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

  return (
    <div className="w-[500px] h-[500px] fixed left-1/2 top-1/2 flex flex-col translate-x-[-50%] translate-y-[-50%] border-2 px-[20px]">
      <form className="flex justify-between  my-[30px]">
        <input className="file-input" type="file" onChange={handleFileChange} />
        <button className="border-2" onClick={uploadFile}>
          upload
        </button>
      </form>
      <div>
        <div className="border-2 p-[10px] h-[300px] mb-[30px]">{text}</div>
        <div>time: {time}</div>
      </div>
    </div>
  );
}
