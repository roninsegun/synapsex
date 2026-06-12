import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, useSpring } from "motion/react";
import { LiquidVideoCanvas } from "./components/LiquidVideoCanvas";
import { ProgressiveBlur } from "./components/ProgressiveBlur";
import { ScrambleText } from "./components/ScrambleText";
import { StatsGrid } from "./components/StatsGrid";

// Reusable ScrollReveal component replicating clean spring slide-reveal animation logic
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 18,
        delay,
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isDownloadHovered, setIsDownloadHovered] = useState(false);
  const [isCardDownloadHovered, setIsCardDownloadHovered] = useState(false);

  const { scrollY } = useScroll();

  // Ultra-smooth dynamic inertia spring config for a slower, cinematic, liquid movement on desktop scroll
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 15,
    damping: 32,
    mass: 1.8,
    restDelta: 0.01
  });

  // Translating the title up by up to 120px as we scroll for high-end cinematic parallax
  const yScaleValue = useTransform(smoothScrollY, [0, 1000], [0, -120]);
  const transform = useMotionTemplate`rotateX(15deg) translateY(${yScaleValue}px) translateZ(10px)`;

  // Set default values and setup native scroll listeners
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
    setSelectedTime("11:00 AM");

    fetch("/api/video-src")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.url) {
          setVideoUrl(data.url);
        }
      })
      .catch((err) => {
        console.error("Failed to load background video:", err);
      });

    // Native window scroll tracker - operates cleanly across all MacBook Trackpads
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight <= 0) return;
      setScrollProgress(scrollTop / scrollHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setBookingSuccess(true);
    setTimeout(() => {
      setIsDemoModalOpen(false);
      setBookingSuccess(false);
      setEmailInput("");
    }, 2800);
  };

  return (
    <div 
      id="edra-root-canvas" 
      className="relative w-full min-h-screen bg-white select-none overflow-x-hidden"
    >
      {/* Background Video with progressive blur and opacity fading */}
      {videoUrl && <LiquidVideoCanvas videoUrl={videoUrl} scrollProgress={scrollProgress} />}

      {/* Progressive bottom blur layer */}
      <ProgressiveBlur position="bottom" backgroundColor="#ffffff" height="150px" blurAmount="4px" className="fixed bottom-0 z-30" />

      {/* HEADER SECTION: Fixed smoothly to top of viewport */}
      <header 
        id="edra-main-header" 
        className="fixed top-0 left-0 right-0 h-20 px-4 sm:px-8 flex items-center justify-between z-50 bg-transparent pointer-events-auto"
      >
        <div id="header-left-group" className="flex items-center gap-2">
          {/* Logo Button */}
          <motion.button
            id="edra-logo-pill"
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMenuOpen(false);
              setIsDemoModalOpen(false);
            }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.12)" }}
            whileTap={{ scale: 0.98 }}
            className={`h-12 px-5 bg-black/[0.08] backdrop-blur-md rounded-[14px] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 ${isMenuOpen ? "hidden sm:flex" : "flex"}`}
          >
            <svg 
              viewBox="-50 -50 100 100" 
              className="w-[18px] h-[18px] text-black shrink-0"
            >
              <g fill="currentColor">
                <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" />
                <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" transform="rotate(90)" />
                <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" transform="rotate(180)" />
                <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" transform="rotate(270)" />
              </g>
            </svg>
            <span className="font-sans text-[16px] font-medium tracking-tight text-black leading-none">
              SynapseX
            </span>
          </motion.button>

          {/* Expanding Menu Pill Button (Skiper3 Inspired Layout) */}
          <motion.div
            id="edra-hamburger-btn"
            layout
            initial={false}
            animate={{ 
              width: !isMenuOpen ? 48 : "290px",
              backgroundColor: !isMenuOpen ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,1)"
            }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="h-12 rounded-[14px] flex items-center overflow-hidden backdrop-blur-md relative font-sans"
          >
            <AnimatePresence mode="wait">
              {!isMenuOpen ? (
                <motion.button
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => setIsMenuOpen(true)}
                  className="w-12 h-12 flex items-center justify-center text-black cursor-pointer"
                  aria-label="Open Menu"
                >
                  <Menu className="w-5 h-5 text-black" strokeWidth={1.8} />
                </motion.button>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: 0.05 }}
                  className="flex items-center justify-between w-full h-full pl-4 pr-1.5 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <span 
                      onClick={() => {
                        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
                        setIsMenuOpen(false);
                      }}
                      className="font-sans font-normal text-[16px] text-white/85 hover:text-white cursor-pointer transition-colors leading-[1]"
                    >
                      Metrics
                    </span>
                    <span 
                      onClick={() => {
                        window.scrollTo({ top: window.innerHeight * 2, behavior: "smooth" });
                        setIsMenuOpen(false);
                      }}
                      className="font-sans font-normal text-[16px] text-white/85 hover:text-white cursor-pointer transition-colors leading-[1]"
                    >
                      Future
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                    className="w-9 h-9 rounded-[11px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* RIGHT GROUP: Download header pill button */}
        <div id="header-right-group">
          <motion.button
            id="edra-book-demo-pill"
            type="button"
            onMouseEnter={() => setIsDownloadHovered(true)}
            onMouseLeave={() => setIsDownloadHovered(false)}
            onClick={() => {
              setIsDemoModalOpen(true);
              setIsMenuOpen(false);
            }}
            whileHover={{ scale: 1.03, backgroundColor: "#222222" }}
            whileTap={{ scale: 0.97 }}
            className="h-12 px-6 bg-black rounded-full flex items-center gap-2.5 cursor-pointer transition-all duration-150 shadow-sm text-white"
          >
            <i className="bi bi-apple text-[16px] shrink-0 text-white -translate-y-[1px]"></i>
            <ScrambleText
              text="Download"
              isHovered={isDownloadHovered}
              className="font-sans font-medium text-[16px] text-white normal-case leading-none"
            />
          </motion.button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main 
        id="edra-main-scrolling-content" 
        className="relative w-full flex flex-col pt-20 pb-36 px-4 sm:px-8 z-10 pointer-events-auto"
      >
        {/* Ambient background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        {/* SECTION 1: Hero Section with Perspective Scroll Animation */}
        <div 
          className="relative w-full max-w-7xl mx-auto flex flex-col justify-start pt-[82vh] pb-12 pointer-events-auto"
        >
          <div 
            className="w-full flex items-center justify-center py-6"
            style={{
              transformStyle: "preserve-3d",
              perspective: "500px",
            }}
          >
            <motion.div
              style={{
                transformStyle: "preserve-3d",
                transform,
              }}
              className="w-full text-center"
            >
              <h1 className="font-sans font-normal text-[22px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-black leading-[1.3] tracking-[-0.02em] max-w-4xl mx-auto select-none px-12 sm:px-24">
                A neural-AI interface built on the architecture of the human nervous system. SynapseX translates synaptic activity into computational intelligence. Every signal becomes measurable, structured, and visible. It continuously reconstructs internal state as a dynamic neural map. Biological noise is filtered into actionable cognitive patterns.
              </h1>
            </motion.div>
          </div>
        </div>

        {/* SECTION 2: Modern Stats screen (Full-Width Swipe Coverflow with no border truncation) */}
        <div className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] relative mt-16 pointer-events-auto overflow-hidden">
          <ScrollReveal>
            <StatsGrid />
          </ScrollReveal>
        </div>
      </main>

      {/* INTERACTIVE SCHEDULING DIALOG MODAL */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div 
            id="demo-modal-wrapper" 
            className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto pointer-events-auto"
          >
            <motion.div
              id="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!bookingSuccess) setIsDemoModalOpen(false);
              }}
              className="absolute inset-0 bg-[#f5f4ef]/80 backdrop-blur-[6px]"
            />

            <motion.div
              id="modal-content-card"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-[460px] bg-[#fcfbf8] rounded-[24px] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {bookingSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-5">
                      <Sparkles className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="font-serif text-2xl text-black mb-3">
                      Your Demo is Slotted
                    </h3>
                    <p className="text-[13.5px] text-black/60 max-w-[320px] leading-relaxed font-sans px-2">
                      An invitation and spatial design catalog link have been dispatched to <span className="font-semibold text-black">{emailInput}</span>. We're excited to guide you.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="form">
                    <div className="flex items-center justify-between pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                        <h3 className="font-sans font-bold text-[19px] text-black">
                          Schedule a Product Walkthrough
                        </h3>
                      </div>
                      <button
                        id="dismiss-modal-btn"
                        onClick={() => setIsDemoModalOpen(false)}
                        className="w-8 h-8 rounded-full hover:bg-black/[0.04] flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4 text-black" strokeWidth={1.8} />
                      </button>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      {/* Date Select picker */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-bold text-black/50 uppercase tracking-wider block">
                          Select Preferred Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                          <input
                            id="demo-date-picker"
                            required
                             type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-black/[0.03] transition-colors focus:bg-black/[0.06] rounded-xl pl-10 pr-4 py-3 text-sm text-black outline-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Time Select picker */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-bold text-black/50 uppercase tracking-wider block">
                          Select Time Window
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["10:00 AM", "11:00 AM", "1:30 PM", "3:30 PM"].map((timeOption) => (
                            <button
                              key={timeOption}
                              id={`time-opt-${timeOption.replace(/[\s:]/g, '-')}`}
                              type="button"
                              onClick={() => setSelectedTime(timeOption)}
                              className={`py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center
                                ${selectedTime === timeOption
                                  ? "bg-black text-white shadow-sm"
                                  : "bg-black/[0.03] text-black/70 hover:bg-black/[0.06]"
                                }
                              `}
                            >
                              {timeOption}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5 text-left pt-2">
                        <label className="text-[11px] font-bold text-black/50 uppercase tracking-wider block">
                          Corporate Email Address
                        </label>
                        <input
                          id="corporate-email-field"
                          required
                          type="email"
                          placeholder="you@company.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-black/[0.03] transition-colors focus:bg-black/[0.06] rounded-xl px-4 py-3 text-sm text-black outline-none"
                        />
                      </div>

                      {/* Submit form trigger */}
                      <button
                        id="submit-booking-btn"
                        type="submit"
                        className="w-full h-12 bg-black hover:bg-zinc-800 rounded-xl font-bold text-[12px] uppercase tracking-[0.14em] text-white cursor-pointer mt-6 flex items-center justify-center gap-2 transition-all"
                      >
                        Confirm Slot Request
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
