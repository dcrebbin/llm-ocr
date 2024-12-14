"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>("No Content");

  const [isLoading, setIsLoading] = useState(false);

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
      body: JSON.stringify({ image: image, model: "gpt-4o-mini" }),
    });
    const data = await response.json();
    setOcrResult(data);
    setIsLoading(false);
  };

  function convertToMarkdown(content: string): string {
    return (
      content
        // Convert headers
        .replace(/<h[1-6]>(.*?)<\/h[1-6]>/g, (_, text) => `# ${text}\n\n`)
        // Convert paragraphs
        .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
        // Convert bold
        .replace(/<(strong|b)>(.*?)<\/(strong|b)>/g, "**$2**")
        // Convert italic
        .replace(/<(em|i)>(.*?)<\/(em|i)>/g, "*$2*")
        // Convert links
        .replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)")
        // Convert unordered lists
        .replace(/<ul>(.*?)<\/ul>/g, "$1\n")
        .replace(/<li>(.*?)<\/li>/g, "- $1\n")
        // Convert ordered lists
        .replace(/<ol>(.*?)<\/ol>/g, "$1\n")
        .replace(/<li>(.*?)<\/li>/g, "1. $1\n")
        // Convert line breaks
        .replace(/<br\s*\/?>/g, "\n")
        // Clean up extra spaces and lines
        .replace(/\n\s*\n/g, "\n\n")
        .trim()
    );
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen p-4">
      <input type="file" onChange={handleFileChange} />
      <div className="relative w-[300px] h-[300px]">
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
      <div className="mt-4">
        {ocrResult && <pre>{convertToMarkdown(ocrResult)}</pre>}
      </div>
    </div>
  );
}
