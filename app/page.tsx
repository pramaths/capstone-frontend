'use client'
import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { AiOutlineCloudUpload, AiOutlineLoading } from "react-icons/ai";
import { MdVolumeUp, MdContentCopy } from "react-icons/md";
// import toast, { Toaster, ToastOptions } from "react-hot-toast";

interface AnalysisResult {
  fileName?: string;
  summary?: string;
  fileUrl?: string;
}

export default function ResearchPaperPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // const toastOptions: ToastOptions = {
  //   duration: 4000,
  //   position: "top-center",
  //   style: {},
  //   className: "",
  //   icon: "",
  //   iconTheme: {
  //     primary: "#000",
  //     secondary: "#fff",
  //   },
  //   ariaProps: {
  //     role: "status",
  //     "aria-live": "polite",
  //   },
  // };

  // const notify = (message: string) => toast(message, toastOptions);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      // notify('Please upload a PDF file');
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysis({
        fileName: file.name,
        summary: data.summary,
        fileUrl: URL.createObjectURL(file)
      });
    } catch (error) {
      console.error('Error analyzing file:', error);
      // notify('Error analyzing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextToSpeech = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // notify("Text copied to clipboard!");
    }).catch((error) => {
      console.error("Error copying text:", error);
    });
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Research Paper Analysis
          </h1>
          
          <div
            className={`border-4 border-dashed rounded-xl p-8 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            } transition-all duration-200 ease-in-out`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <AiOutlineCloudUpload className="w-16 h-16 text-blue-500" />
              <p className="text-xl text-gray-600">
                Drag and drop your research paper here
              </p>
              <span className="text-sm text-gray-500">or</span>
              <label className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileInput}
                />
              </label>
            </div>
          </div>

          {isLoading && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing your research paper...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-josefin bg-white border-4 border-white-700 h-screen overflow-hidden">
      <div className="w-full flex flex-row justify-between items-center">
        <div className="text-black flex">
          <a href="/home">
            <FaHome className="text-2xl m-2" />
          </a>
          <div className="p-2 text-black font-bold text-center">
            {analysis.fileName}
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold p-1 mt-1 ml-1 mb-2 text-black">
            Research Paper Analysis
          </h4>
        </div>
        <div></div>
      </div>

      <div className="w-full flex flex-row">
        {/* left side - PDF Viewer */}
        <div className="w-1/2 h-screen overflow-hidden">
          <div className="h-full overflow-auto w-full">
            <iframe
              src={analysis.fileUrl}
              width="100%"
              height="100%"
              title={analysis.fileName}
            ></iframe>
          </div>
        </div>

        {/* right side - Summary */}
        <div className="w-1/2 flex flex-col h-screen text-black-500">
          <div className="flex flex-col overflow-y-auto p-2 h-full">
            <div className="p-1">
              <div className="text-black border-2 rounded-lg border-stone-200 bg-stone-200 pt-2 pl-2 pr-2 pb-2 shadow-lg shadow-stone-500/50 mr-10 ml-2">
                <h3 className="font-bold mb-4">Summary</h3>
                {analysis.summary}
                <div className="flex mt-2 items-center space-x-2">
                  <button
                    onClick={() => handleTextToSpeech(analysis.summary!)}
                    className="text-blue-500 underline"
                  >
                    <MdVolumeUp />
                  </button>
                  <button
                    onClick={() => handleCopyText(analysis.summary!)}
                    className="text-blue-500 underline"
                  >
                    <MdContentCopy />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Toaster /> */}
    </div>
  );
}