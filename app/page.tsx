"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: chatHandleSubmit,
    status,
  } = useChat({
    api: "/api/chat",
    body: {
      userId: localStorage.getItem("userId"),
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Focus input on initial load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Focus input when AI response is complete
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      inputRef.current?.focus();
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    chatHandleSubmit(e);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="w-full bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Product Q&A Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Get instant answers to all your product-related questions
              </p>
            </div>
            <Link
              href="/upload"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Products
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 pb-20">
          <div className={`flex flex-col space-y-4`}>
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 my-8">
                Start asking questions about our products!
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 dark:text-gray-200"
                  } rounded-lg px-4 py-2 max-w-[80%] shadow-sm`}
                >
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="prose dark:prose-invert max-w-none [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_table]:w-full"
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        );
                    }
                  })}
                </div>
              </div>
            ))}
            {status === "streaming" && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 pt-4 pb-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4">
            <div className="relative">
              <input
                ref={inputRef}
                className="w-full p-4 pr-16 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                placeholder="Ask about our products..."
                onChange={handleInputChange}
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
