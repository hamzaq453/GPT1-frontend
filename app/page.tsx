"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid"; // To generate unique thread_id

export default function Home() {
  const [query, setQuery] = useState(""); // Store user input
  const [messages, setMessages] = useState<
    { role: string; text: string; loading?: boolean }[]
  >([]); // Store the conversation with a loading state for each message
  const [showPrompts, setShowPrompts] = useState(true); // Toggle for showing prompts
  const [threadId, setThreadId] = useState(""); // Unique thread ID for session
  const [contextEnabled, setContextEnabled] = useState(false); // Toggle for context usage

  // Generate or retrieve a thread ID when the component mounts
  useEffect(() => {
    const existingThreadId = localStorage.getItem("thread_id");
    if (existingThreadId) {
      setThreadId(existingThreadId);
    } else {
      const newThreadId = uuidv4();
      localStorage.setItem("thread_id", newThreadId);
      setThreadId(newThreadId);
    }
  }, []);

  // Suggested prompts
  const prompts = [
    "What are the top destinations to visit in 2024?",
    "What is an API?",
    "What is the future of AI?",
  ];

  // Function to handle user query submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };
    const loadingMessage = { role: "ai", text: "", loading: true };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setQuery(""); // Clear input

    // Hide prompts after the first submission
    setShowPrompts(false);

    try {
      const res = await fetch("https://gpt-1-backend.vercel.app/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          thread_id: threadId, // Pass the thread ID
          context_enabled: contextEnabled, // Enable or disable context
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch the response");
      }

      const data = await res.json();
      const aiMessage = { role: "ai", text: data.response, loading: false };

      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = aiMessage; // Replace the loading message with the actual response
        return updatedMessages;
      });
    } catch {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          role: "ai",
          text: "GPT1: Error: Unable to fetch response.",
          loading: false,
        };
        return updatedMessages;
      });
    }
  };

  // Function to handle suggested prompt clicks
  const handlePromptClick = (prompt: string) => {
    setQuery(prompt);
    setShowPrompts(false); // Hide prompts after a prompt is clicked
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-white">
      {/* Header */}
      <header className="mb-6 text-center p-4">
        <h1 className="text-3xl font-bold mt-10">Hi! I am GPT1</h1>
        <p className="text-lg text-gray-400">How can I help you?</p>
      </header>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[45%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-zinc-800 text-slate-200 self-end"
                  : "bg-zinc-800 text-slate-200 self-start"
              }`}
            >
              {/* Render loader or message text */}
              {message.loading ? (
                <div className="w-6 h-6 border-4 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
              ) : message.role === "ai" ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Prompts */}
      {showPrompts && (
        <div className="flex gap-2 p-4">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="flex-1 bg-zinc-800 text-gray-200 p-3 rounded-lg hover:bg-zinc-700 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Context Toggle */}
      <div className="flex items-center justify-center p-4">
        <label htmlFor="contextToggle" className="text-gray-400 mr-2">
          Enable Context:
        </label>
        <input
          type="checkbox"
          id="contextToggle"
          checked={contextEnabled}
          onChange={(e) => setContextEnabled(e.target.checked)}
          className="form-checkbox text-zinc-700 rounded"
        />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-zinc-900 p-4 flex items-center justify-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          className="w-[40%] p-4 bg-black text-white border border-gray-700 rounded-lg"
          required
        />
        <button
          type="submit"
          className="bg-zinc-700 text-white py-2 px-6 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
