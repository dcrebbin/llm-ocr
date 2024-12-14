"use client";

import Image from "next/image";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>("No Content");

  const [isLoading, setIsLoading] = useState(false);

  const markdownTest = `
  # Hello World
  ## Hello World
  ### Hello World
  - Hello World
  - Hello World
  - Hello World
  `;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOcr = async () => {
    setIsLoading(true);
    const response = await fetch("/api/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: image, model: "gpt-4o" }),
    });
    const data = await response.json();
    setOcrResult(data.replace("```markdown", ""));
    setIsLoading(false);
  };

  return (
    <div className="flex flex-row items-start justify-start h-screen p-4">
      <div className="w-1/2 flex flex-col items-center justify-start gap-4">
        <input type="file" onChange={handleFileChange} />
        <div className="relative w-[650px] h-[650px]">
          {image && (
            <Image
              src={image}
              fill
              alt="Uploaded Image"
              className="w-full h-auto object-contain"
            />
          )}
        </div>
        <button
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          onClick={handleOcr}
        >
          OCR {isLoading ? "..." : ""}
        </button>
      </div>
      <div className="mt-4 prose prose-invert w-1/2">
        <Markdown remarkPlugins={[remarkGfm]}>{ocrResult}</Markdown>
      </div>
    </div>
  );
}
