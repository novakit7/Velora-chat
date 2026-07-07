import React from "react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center">
      <div className="rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-text animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-text animate-pulse delay-150"></div>
          <div className="h-2 w-2 rounded-full bg-text animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
}