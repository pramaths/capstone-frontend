'use client'
import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import toast, { Toaster, ToastOptions } from "react-hot-toast";

interface AnalysisResult {
  fileName?: string;
  summaries?: {
    final_summary?: string;
    section_summaries?: Record<string, string>;
    image_summaries?: Record<string, string>;
  };
  fileUrl?: string;
}

export default function ResearchPaperPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryType, setSummaryType] = useState<'full' | 'section' | 'image'>('full');

  const toastOptions: ToastOptions = {
    duration: 4000,
    position: "top-center",
    style: {},
    className: "",
    icon: "🚀🚀🦾🦾",
    iconTheme: {
      primary: "#000",
      secondary: "#fff",
    },
    ariaProps: {
      role: "status",
      "aria-live": "polite",
    },
  };

  const notify = (message: string) => toast(message, toastOptions);

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
      notify('Please upload a PDF file');
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze file');
      }

      const data = await response.json();
      setAnalysis({
        fileName: file.name,
        summaries: {
          final_summary: data.final_summary,
          section_summaries: data.section_summaries,
          image_summaries: data.image_summaries,
        },
        fileUrl: URL.createObjectURL(file),
      });
    } catch (error) {
      console.error('Error analyzing file:', error);
      notify('Error analyzing file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      notify("Text copied to clipboard!");
    }).catch((error) => {
      console.error("Error copying text:", error);
    });
  };

  const handleSummaryTypeChange = (type: 'full' | 'section' | 'image') => {
    setSummaryType(type);
    notify(`Switched to ${type} summary`);
  };

  const renderSummary = () => {
    if (!analysis?.summaries) return null;

    const { final_summary, section_summaries, image_summaries } = analysis.summaries;

    switch (summaryType) {
      case 'full':
        return (
          <div className="mb-4 text-black">
            <p>{final_summary}</p>
            <button
              onClick={() => handleCopyText(final_summary as string)}
              className="text-blue-500 mt-2"
            >
              <MdContentCopy />
            </button>
          </div>
        );
      case 'section':
        return Object.entries(section_summaries || {}).map(([section, content]) => (
          <div key={section} className="mb-6">
            <h4 className="font-bold text-lg mb-2 text-black">{section}</h4>
            <p className="text-gray-700">{content}</p>
            <button
              onClick={() => handleCopyText(content)}
              className="text-blue-500 mt-2"
            >
              <MdContentCopy />
            </button>
          </div>
        ));
      case 'image':
        return Object.entries(image_summaries || {}).map(([image, content]) => (
          <div key={image} className="mb-6">
            <h4 className="font-bold text-lg mb-2 text-black">{image}</h4>
            <p className="text-gray-700">{content}</p>
            <button
              onClick={() => handleCopyText(content)}
              className="text-blue-500 mt-2"
            >
              <MdContentCopy />
            </button>
          </div>
        ));
      default:
        return null;
    }
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <a href="/" className="mr-4">
            <FaHome className="text-2xl" />
          </a>
          <div className="font-bold">
            {analysis.fileName}
          </div>
        </div>
        <div className="font-semibold text-lg">
          Research Paper Analysis
        </div>
        <div></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* PDF Viewer */}
        <div className="w-1/2 h-full border-r">
          <object
            data={analysis.fileUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <embed
              src={analysis.fileUrl}
              type="application/pdf"
              className="w-full h-full"
            />
          </object>
        </div>

        {/* Summary Panel */}
        <div className="w-1/2 flex flex-col h-full">
          {/* Summary Type Buttons */}
          <div className="flex justify-center space-x-4 p-4 border-b">
            <button
              onClick={() => handleSummaryTypeChange('full')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                summaryType === 'full'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Full Summary
            </button>
            <button
              onClick={() => handleSummaryTypeChange('section')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                summaryType === 'section'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Section Summary
            </button>
            <button
              onClick={() => handleSummaryTypeChange('image')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                summaryType === 'image'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Image Summary
            </button>
          </div>

          {/* Summary Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-stone-200 rounded-lg p-6 shadow-lg">
              <h3 className="font-bold mb-4 text-black">Summary</h3>
              {renderSummary()}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}