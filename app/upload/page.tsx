"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Check if userId exists in localStorage, if not create and set it
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", uuidv4());
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setResponse("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setUploading(true);
    setError("");
    setResponse("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", localStorage.getItem("userId") || "");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResponse(
        `Upload successful! ${
          data.message || ""
        } Please click 'Back to Home' to continue.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during upload"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={2} />
            <span className="text-sm">Back</span>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Upload Product Catalog CSV File
          </h1>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100"
                />
                <Button onClick={handleUpload} disabled={uploading || !file}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {response && (
                <div className="p-4 bg-green-50 text-green-700 rounded-md">
                  {response}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
