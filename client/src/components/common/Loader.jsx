import { useState, useEffect } from "react";

const Loader = ({ size = "md", variant = "fullscreen", className = "" }) => {
  const dotSize = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-5 w-5",
    xl: "h-7 w-7",
  };

  const loadingTexts = [
    "Connecting...",
    "Loading conversations...",
    "Finding your friends...",
    "Syncing messages...",
    "Preparing your chats...",
    "Almost there...",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (variant === "button") return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [variant]);
  useEffect(() => {
    document.body.style.cursor = "wait";
    document.documentElement.style.cursor = "wait";

    return () => {
      document.body.style.cursor = "default";
      document.documentElement.style.cursor = "default";
    };
  }, []);

  // Button Loader
  if (variant === "button") {
    return (
      <div className="inline-flex items-center justify-center gap-1.5">
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            className={`${dotSize[size]} rounded-full bg-white animate-bounce`}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    );
  }

  const containerClass = {
    fullscreen:
      "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg/90 backdrop-blur-sm cursor-wait",
    section:
      "absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-bg/70 backdrop-blur-sm",
  };
  
  return (
    <div className={`${containerClass[variant]} ${className}`}>
      <div className="flex items-center gap-2">
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            className={`${dotSize[size]} rounded-full bg-primary animate-bounce`}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <p className="mt-5 text-sm font-medium tracking-wide text-text">
        {loadingTexts[index]}
      </p>
    </div>
  );
};

export default Loader;
