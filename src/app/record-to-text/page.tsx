// 직접 녹음해서 자막 받기
"use client";

import axios from "axios";
import { useState } from "react";

export default function RecordToText() {
  // const [file, setFile] = useState<string | Blob>();
  const [text, setText] = useState<string>("");
  const [time, setTime] = useState<number>();

  const uploadFile = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    // if (file) {
    //   formData.append("file", file);
    // }

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
      <div className="flex justify-between  my-[30px]">
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
