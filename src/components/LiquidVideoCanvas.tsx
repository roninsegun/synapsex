import React, { useEffect, useRef, useState } from "react";

interface LiquidVideoCanvasProps {
  videoUrl: string;
  scrollProgress: number;
}

export function LiquidVideoCanvas({ videoUrl, scrollProgress }: LiquidVideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetPercentRef = useRef(0);
  const smoothPercentRef = useRef(0);

  // Keep targetPercent updated based on scroll progress from parent container
  useEffect(() => {
    targetPercentRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset video state when source changes
    video.currentTime = 0;
    video.preload = "auto";
    video.load(); // Request browser to aggressively cache and preload frames

    let rafId: number;

    const checkViewportAndConfig = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        video.autoplay = false;
        video.pause();
      } else {
        video.autoplay = true;
        video.play().catch((err) => {
          console.warn("Autoplay was blocked or waiting for gesture:", err);
        });
      }
    };

    video.addEventListener("loadedmetadata", checkViewportAndConfig);
    checkViewportAndConfig();

    // High performance animation loop coordinating video frame seeks
    const tick = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop) {
        // Fallback for mobile: standard autoplay loop, skip manual scrubbing for performance
        rafId = requestAnimationFrame(tick);
        return;
      }

      const targetPercent = targetPercentRef.current;
      let smoothPercent = smoothPercentRef.current;

      // Buttery smooth exponential decay / interpolation (LERP)
      smoothPercent += (targetPercent - smoothPercent) * 0.15;

      if (Math.abs(targetPercent - smoothPercent) < 0.0002) {
        smoothPercent = targetPercent;
      }

      smoothPercentRef.current = smoothPercent;

      if (video.duration > 0 && !video.seeking) {
        const calculatedTime = smoothPercent * video.duration;
        const clampedTime = Math.max(0, Math.min(video.duration, calculatedTime));
        
        // Only trigger heavy browser seek operation if difference is meaningful
        if (Math.abs(video.currentTime - clampedTime) > 0.01) {
          video.currentTime = clampedTime;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const handleResize = () => {
      checkViewportAndConfig();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", checkViewportAndConfig);
      window.removeEventListener("resize", handleResize);
    };
  }, [videoUrl]);

  // The custom request: Only begin blur at the last screen (scrollProgress from 0.6 to 1.0)
  const lastScreenProgress = Math.max(0, Math.min(1, (scrollProgress - 0.6) / 0.4));
  
  const blurVal = lastScreenProgress * 65; // perfect каша blur
  const opacityVal = 1.0; // Keep opacity constant at 1.0 to prevent darkening/dimming
  const scaleVal = 1.05 + lastScreenProgress * 0.1; // modest scale up

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-white z-[1]">
      <video
        ref={videoRef}
        src={videoUrl}
        id="scrubbable-liquid-video"
        loop
        muted
        playsInline
        preload="auto"
        style={{
          filter: `blur(${blurVal}px)`,
          opacity: opacityVal,
          transform: `scale(${scaleVal})`,
          transition: "filter 0.08s ease-out, opacity 0.08s ease-out, transform 0.08s ease-out"
        }}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}
