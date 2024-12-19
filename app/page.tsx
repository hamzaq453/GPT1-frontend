"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [query, setQuery] = useState(""); // Store user input
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]); // Store the conversation
  const [loading, setLoading] = useState(false); // Show loading state
  const [showPrompts, setShowPrompts] = useState(true); // Toggle for showing prompts

  // Suggested prompts
  const prompts = [
    "What are the top destinations to visit in 2024?",
    "What makes SayHalo AI unique?",
    "What are the trending design ideas on TikTok in 2024?",
  ];

// Function to handle user query submission
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  if (!query.trim()) return;

  const userMessage = { role: "user", text: query };
  setMessages((prev) => [...prev, userMessage]);
  setQuery(""); // Clear input
  setLoading(true);

  try {
    const res = await fetch("https://gpt-1-backend-51z15yo12-hamzaq453s-projects.vercel.app/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        context_enabled: false,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch the response");
    }

    const data = await res.json();
    const aiMessage = { role: "ai", text: data.response }; // No prefixing as GPT1 generates formatted markdown
    setMessages((prev) => [...prev, aiMessage]); // Add AI response
  } catch {
    const errorMessage = { role: "ai", text: "GPT1: Error: Unable to fetch response." };
    setMessages((prev) => [...prev, errorMessage]); // Add error response
  } finally {
    setLoading(false);
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
        <h1 className="text-3xl font-bold">Hi! I am GPT1</h1>
        <p className="text-lg text-gray-400">Can I help you with anything?</p>
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
                  ? "bg-zinc-800 text-white self-end"
                  : "bg-gray-700 text-white self-start"
              }`}
            >
              {/* Render markdown for AI responses */}
              {message.role === "ai" ? (
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
              className="flex-1 bg-gray-700 text-gray-200 p-3 rounded-lg hover:bg-gray-600 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-zinc-900 p-4 flex items-center justify-center gap-2 border-t border-gray-700"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          className="w-[30%] p-3 bg-black text-white border border-gray-700 rounded-lg"
          required
        />
        <button
          type="submit"
          className="bg-zinc-700 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
