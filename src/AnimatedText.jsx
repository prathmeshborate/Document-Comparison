import React, { useState, useEffect } from "react";

function AnimatedText() {
  const text = "One-stop solution for Validating MahaRERA Sales Agreement Format";
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    let currentChar = 0;

    const typingInterval = setInterval(() => {
      if (currentChar < text.length) {
        setDisplayedText((prev) => prev + text[currentChar]);
        currentChar++;
      } else {
        clearInterval(typingInterval);
        setIsAnimationComplete(true);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [text]);

  useEffect(() => {
    if (!isAnimationComplete) {
      const cursorBlinking = setInterval(() => {
        setCursorVisible((prev) => !prev);
      }, 500);
      return () => clearInterval(cursorBlinking);
    }

    if (isAnimationComplete) {
      setTimeout(() => setCursorVisible(false), 1000);
    }
  }, [isAnimationComplete]);

  return (
    <div className="relative flex justify-center items-center">
      <p className="text-2xl font-bold text-black">
        {displayedText}
        {cursorVisible && <span className="blinking-cursor">|</span>}
      </p>
    </div>
  );
}

export default AnimatedText;
