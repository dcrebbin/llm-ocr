"use client";

import Image from "next/image";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [image, setImage] = useState<string[] | null>(null);
  const [ocrResult, setOcrResult] = useState<string[] | null>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const filePromises = fileArray.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then((results) => {
        setImage(results);
      });
    }
  };

  const handleOcr = async () => {
    if (!image) return;
    setIsLoading(true);

    for (const [index, blob] of image.entries()) {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: blob, model: "gpt-4o" }),
      });
      try {
        const data = await response.json();
        if (data) {
          setOcrResult((prev) => [
            ...(prev || []),
            data.replace("```markdown", ""),
          ]);
        }
        console.log("Processed image:", index + 1);
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-row items-start justify-start h-screen p-4">
      <div className="w-1/2 flex flex-col items-center justify-start gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="image/*"
        />
        <div className="relative w-[650px] h-[650px] flex flex-col gap-4 overflow-hidden">
          {image && (
            <>
              <Image
                src={image[currentPage]}
                fill
                alt={`Uploaded Image ${currentPage + 1}`}
                className="w-full h-auto object-contain absolute"
              />
            </>
          )}
        </div>
      </div>
      <button
        disabled={isLoading || image?.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 absolute top-0 m-3 ml-[50%] -translate-x-1/2"
        onClick={handleOcr}
      >
        {isLoading
          ? `Processing Images...Image: ${ocrResult?.length || 1}`
          : "Bulk Process Images"}
      </button>
      <div className="mt-4 prose prose-invert w-1/2 flex flex-col items-center justify-start gap-4v h-screen overflow-scroll">
        {ocrResult && (
          <>
            <div className="flex flex-col gap-4 w-[80%] prose prose-invert h-screen overflow-scroll py-4 pl-4">
              {ocrResult
                .slice(currentPage * 1, (currentPage + 1) * 1)
                .map((result, index) => (
                  <Markdown remarkPlugins={[remarkGfm]} key={index}>
                    {result}
                  </Markdown>
                ))}
            </div>
            <div className="flex gap-2 mt-4 fixed bottom-0 right-0 w-full bg-black justify-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage + 1} of {Math.ceil((image?.length || 0) / 1)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil((image?.length || 0) / 1) - 1, p + 1)
                  )
                }
                disabled={
                  currentPage >= Math.ceil((image?.length || 0) / 1) - 1
                }
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
