'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';


export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-green-900">
      <header className="p-4 bg-amber-50 border-b">
        <div className="max-w-3xl mx-auto flex-col items-center  space-x-3">

          <h1 className="text-xl font-bold text-gray-800 text-center">SwapEnv Assistant</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white shadow-md'
                }`}
              >
                {m.content ? (
                  <div className="prose prose-sm">
                    {m.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="animate-pulse">⚡</span>
                    <span>Processing request...</span>
                  </div>
                )}
                {m.toolInvocations?.map((tool, index) => (
                  <div
                    key={index}
                    className="mt-2 p-3 bg-gray-100 rounded-lg text-sm font-mono"
                  >
                    <span className="text-gray-500">Tool call:</span>{' '}
                    {tool.toolName}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white border-t py-4"
      >
        <div className="max-w-3xl mx-auto relative">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about environment variables, configurations, or deployments..."
            className="w-full pr-12 pl-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!input}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-500 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:bg-gray-200 transition-colors"
          >
            
          </button>
        </div>
      </form>
    </div>
  );
}