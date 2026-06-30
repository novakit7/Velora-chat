import React from "react";

const Loader = ({
  text = "Loading...",
  size = "md",
  overlay = true,
  className = "",
}) => {
  const dotSize = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div
      className={`
        absolute inset-0 z-50
        flex flex-col items-center justify-center
        ${overlay ? "bg-white/60 backdrop-blur-[2px]" : ""}
        ${className}
      `}
    >
      {/* Dots */}
      <div className="flex items-center gap-2">
        <span
          className={`${dotSize[size]} rounded-full bg-indigo-600 animate-bounce`}
          style={{
            animationDelay: "-0.3s",
            animationDuration: "1.1s",
          }}
        />
        <span
          className={`${dotSize[size]} rounded-full bg-indigo-600 animate-bounce`}
          style={{
            animationDelay: "-0.15s",
            animationDuration: "1.1s",
          }}
        />
        <span
          className={`${dotSize[size]} rounded-full bg-indigo-600 animate-bounce`}
          style={{
            animationDuration: "1.1s",
          }}
        />
      </div>

      {/* Text */}
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600 tracking-wide">
          {text}
        </p>
      )}
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