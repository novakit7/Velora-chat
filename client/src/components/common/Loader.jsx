import { useState,useEffect } from "react";

const Loader = ({
  size = "md",
  overlay = true,
  className = "",
}) => {
 const dotSize = {
  sm: "h-2 w-2",      // Inline/button loader
  md: "h-3 w-3",      // Card/form loader
  lg: "h-10 w-10",      // Section loader
};
  const loadingTexts = [
  "Connecting...",
  "Starting Velora...",
  "Loading conversations...",
  "Finding your friends...",
  "Syncing messages...",
  "Preparing your chats...",
  "Almost there..."
];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);


  return (
    <div
      className={`
        absolute inset-0 z-50
        flex flex-col items-center justify-center
        ${overlay ? "bg-bg-secondary backdrop-blur-[2px]" : ""}
        ${className}
      `}
    >
      {/* Dots */}
      <div className="flex items-center gap-2">
        <span
          className={`${dotSize[size]} rounded-full bg-primary animate-bounce`}
          style={{
            animationDelay: "-0.3s",
            animationDuration: "1.1s",
          }}
        />
        <span
          className={`${dotSize[size]} rounded-full bg-primary animate-bounce`}
          style={{
            animationDelay: "-0.15s",
            animationDuration: "1.1s",
          }}
        />
        <span
          className={`${dotSize[size]} rounded-full bg-primary animate-bounce`}
          style={{
            animationDuration: "1.1s",
          }}
        />
      </div>
        <p className="mt-4 text-md font-medium text-text tracking-wide">
          {loadingTexts[index]}
        </p>
    </div>
  );
};

export default Loader;


{/* <div className="relative h-24">
  <Loader
    text="Saving..."
    size="sm"
    overlay={false}
  /> */}