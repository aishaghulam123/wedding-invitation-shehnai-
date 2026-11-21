import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PointerEvent as ReactPointerEvent, CSSProperties } from "react";
import { gsap } from "gsap";
import {
  ArrowDown,
  ArrowUpRight,
  Clock3,
  Crown,
  Flower2,
  Heart,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { drawFoil } from "@/lib/scratch-foil";
import {
  getWeddingCountdown,
  weddingInvitation,
  type CountdownParts,
  type WeddingEvent,
} from "@/lib/wedding-invitation-data";
import mayunArtwork from "@/assets/mayun-marigold.jpg";
import mehndiArtwork from "@/assets/mehndi-botanical.jpg";
import baraatArtwork from "@/assets/baraat-ivory-rose.jpg";
import walimaArtwork from "@/assets/walima-ivory-blush.jpg";

const eventIcon = { mayun: Flower2, mehndi: Leaf, baraat: Crown, walima: Heart } as const;

const eventArtwork: Record<string, string> = {
  mayun: mayunArtwork,
  mehndi: mehndiArtwork,
  baraat: baraatArtwork,
  walima: walimaArtwork,
};

export function InvitationSections() {
  return (
    <>
      <div className="invitation-journey">
        <ScratchDateReveal />
        <WeddingCountdown />
        <VenueSection />
        <MainWeddingInvitation />
        <PreWeddingCelebrations />
        <DesignerCredits />
      </div>
    </>
  );
}

export function ScrollInvitationIndicator({ visible }: { visible: boolean }) {
  const discoverInvitation = () => {
    document.querySelector("#date-reveal")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className={`discover-indicator${visible ? " is-visible" : ""}`}
      onClick={discoverInvitation}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label="Scroll to discover the invitation"
    >
      <span>Scroll to Discover</span>
      <ArrowDown aria-hidden="true" />
    </Button>
  );
}

function ScratchDateReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const strokeCount = useRef(0);
  const samplerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasScratched, setHasScratched] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRevealed) return;
    const paper = paperRef.current;
    if (!paper) return;
    gsap.fromTo(".date-number", { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, ease: "elastic.out(1, 0.55)" });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#d9b867", "#f3e1a8", "#e7b7b0", "#b9c79a", "#fff7de"];
    const pieces = Array.from({ length: 44 }, (_, index) => {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.background = colors[index % colors.length] ?? "#d9b867";
      piece.style.left = "50%";
      piece.style.top = "46%";
      paper.appendChild(piece);
      return piece;
    });
    gsap.to(pieces, {
      x: () => gsap.utils.random(-170, 170),
      y: () => gsap.utils.random(-210, 120),
      rotation: () => gsap.utils.random(-540, 540),
      scale: () => gsap.utils.random(0.6, 1.4),
      duration: () => gsap.utils.random(1.2, 2),
      ease: "power3.out",
      onComplete: () => pieces.forEach((piece) => piece.remove()),
    });
    gsap.to(pieces, { autoAlpha: 0, duration: 0.7, delay: 1.2, ease: "power1.in" });
  }, [isRevealed]);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context) return;
    if (isRevealed) {
      canvas.style.display = "none";
      return;
    }
    canvas.style.display = "block";
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    drawFoil(context, canvas.width, canvas.height, ratio);
  }, [isRevealed]);

  useEffect(() => {
    if (!hasScratched) initializeCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      if (!hasScratched) initializeCanvas();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [hasScratched, initializeCanvas]);

  const scratchAt = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context || isRevealed) return;
    const bounds = canvas.getBoundingClientRect();
    const ratioX = canvas.width / bounds.width;
    const ratioY = canvas.height / bounds.height;
    const point = { x: (event.clientX - bounds.left) * ratioX, y: (event.clientY - bounds.top) * ratioY };

    context.globalCompositeOperation = "destination-out";
    context.lineWidth = 48 * Math.min(window.devicePixelRatio || 1, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    if (pointerRef.current) {
      context.moveTo(pointerRef.current.x, pointerRef.current.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    }
    context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
    pointerRef.current = point;
    strokeCount.current += 1;
    if (!hasScratched) setHasScratched(true);

    if (strokeCount.current % 4 !== 0) return;
    const samplerCanvas = samplerCanvasRef.current ?? document.createElement("canvas");
    samplerCanvasRef.current = samplerCanvas;
    samplerCanvas.width = 90;
    samplerCanvas.height = 110;
    const sampleContext = samplerCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;
    sampleContext.drawImage(canvas, 0, 0, samplerCanvas.width, samplerCanvas.height);
    const pixels = sampleContext.getImageData(0, 0, samplerCanvas.width, samplerCanvas.height).data;
    let clearPoints = 0;
    let sampledPoints = 0;
    for (let index = 3; index < pixels.length; index += 4) {
      sampledPoints += 1;
      if ((pixels[index] ?? 255) < 120) clearPoints += 1;
    }
    if (sampledPoints > 0 && clearPoints / sampledPoints >= 0.6) {
      setIsRevealed(true);
    }
  };

  const finishScratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    pointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="paper-section scratch-section" id="date-reveal" aria-labelledby="scratch-heading">
      <div className="section-inner scratch-inner sheet">
        <SectionHeading eyebrow="A little something to discover" title="A Special Date Awaits" id="scratch-heading" />
        <p className="section-intro">Scratch to Reveal Our Wedding Date</p>

        <div ref={paperRef} className={`scratch-paper${hasScratched ? " is-scratching" : ""}${isRevealed ? " is-revealed" : ""}`}>
          <div className="scratch-paper-inner">
            <div className="scratch-corner scratch-corner-one" aria-hidden="true">✧</div>
            <div className="scratch-corner scratch-corner-two" aria-hidden="true">✧</div>
            <div className="scratch-corner scratch-corner-three" aria-hidden="true">✧</div>
            <div className="scratch-corner scratch-corner-four" aria-hidden="true">✧</div>
            <div className="date-underlay" aria-live="polite">
              <span className="date-sunburst" aria-hidden="true" />
              <span className="date-monogram">{weddingInvitation.couple.monogram}</span>
              <p className="date-kicker">Save the Date</p>
              <p className="date-number">{weddingInvitation.wedding.date.split(" ")[0]}</p>
              <p className="date-month">{weddingInvitation.wedding.date.split(" ").slice(1).join(" ")}</p>
              <p className="date-day">{weddingInvitation.wedding.day}</p>
              <span className="date-rule" />
            </div>
          <canvas
              ref={canvasRef}
              className="scratch-surface"
                aria-label={`Scratch here to reveal ${weddingInvitation.couple.bride} and ${weddingInvitation.couple.groom}'s wedding date`}
              onPointerDown={(event) => {
                if (isRevealed) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                scratchAt(event);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) scratchAt(event);
              }}
              onPointerUp={finishScratch}
              onPointerCancel={finishScratch}
            />
            {!hasScratched && !isRevealed && (
              <span className="scratch-callout" aria-hidden="true">
                <span className="scratch-callout-mark">✣</span> Scratch to Reveal Our Wedding Date
              </span>
            )}
            {Array.from({ length: 14 }, (_, index) => (
              <span
                key={index}
                className={`rose-petal rose-petal-${index % 7}${hasScratched ? " petal-in-motion" : ""}`}
                style={
                  {
                    "--petal-index": index,
                    "--petal-delay": `${index * 0.18}s`,
                    "--petal-duration": `${5 + index * 0.33}s`,
                    "--petal-left": index % 2
                      ? `${84 + (Math.floor(index / 2) % 4) * 3}%`
                      : `${4 + (Math.floor(index / 2) % 4) * 3}%`,
                    "--petal-drift": `${(index - 7) * 1.1}rem`,
                  } as CSSProperties
                }
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <header className="section-heading">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      <span className="heading-flourish" aria-hidden="true">✣</span>
    </header>
  );
}

function MainWeddingInvitation() {
  const invitationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = invitationRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let context: gsap.Context | undefined;
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        });
        timeline.fromTo(
          ".formal-invitation",
          { autoAlpha: 0, y: 40, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: "power2.out" },
        );
        timeline.fromTo(
          ".formal-invitation > :not(.formal-side-ornament)",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.16, ease: "power2.out" },
          "-=0.55",
        );
        timeline.fromTo(
          ".formal-rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, stagger: 0.2, ease: "power2.out" },
          "-=1.1",
        );
      }, section);
    });
    return () => context?.revert();
  }, []);

  return (
    <section className="paper-section formal-section" id="invitation" ref={invitationRef} aria-labelledby="invitation-heading">
      <div className="section-inner formal-inner">
        <article className="formal-invitation">
          <span className="formal-side-ornament" aria-hidden="true">❧</span>
          <p className="formal-topline">Together with their families</p>
          <h2 id="invitation-heading" className="formal-couple">{weddingInvitation.couple.fullNames}</h2>
          <div className="formal-families">
            <div className="formal-family">
              <p className="family-name">{weddingInvitation.couple.brideFullName}</p>
              <p className="family-parent">Daughter of {weddingInvitation.couple.brideParent}</p>
            </div>
            <span className="family-and" aria-hidden="true">&amp;</span>
            <div className="formal-family">
              <p className="family-name">{weddingInvitation.couple.groomFullName}</p>
              <p className="family-parent">Son of {weddingInvitation.couple.groomParent}</p>
            </div>
          </div>
          <p className="formal-request">Request the pleasure of your company at their</p>
          <p className="formal-event">{weddingInvitation.wedding.event}</p>
          <span className="formal-rule"><i>✣</i></span>
          <div className="formal-details">
            <p>{weddingInvitation.wedding.day}, {weddingInvitation.wedding.date}</p>
            <p>{weddingInvitation.wedding.time}</p>
          </div>
          <span className="formal-rule"><i>❧</i></span>
          <p className="formal-closing">We look forward to celebrating with you.</p>
          <span className="formal-side-ornament formal-side-ornament-bottom" aria-hidden="true">❧</span>
        </article>
      </div>
    </section>
  );
}

const RING_LENGTH = 2 * Math.PI * 44;

function WeddingCountdown() {
  const [countdown, setCountdown] = useState<CountdownParts>({
    complete: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const countdownRef = useRef<HTMLElement>(null);
  const startDays = useRef(1);

  useEffect(() => {
    const first = getWeddingCountdown(weddingInvitation.wedding.isoDateTime);
    startDays.current = Math.max(first.days, 1);
    setCountdown(first);
    const interval = window.setInterval(() => {
      setCountdown(getWeddingCountdown(weddingInvitation.wedding.isoDateTime));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(".countdown-value", { y: 5, autoAlpha: 0.72 }, { y: 0, autoAlpha: 1, duration: 0.22, ease: "power1.out" });
  }, [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]);

  useEffect(() => {
    const section = countdownRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let context: gsap.Context | undefined;
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        gsap.fromTo(
          ".countdown-ring",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 78%", once: true },
          },
        );
      }, section);
    });
    return () => context?.revert();
  }, []);

  if (countdown.complete) {
    return (
      <section className="paper-section countdown-section" ref={countdownRef} aria-labelledby="countdown-heading">
        <div className="section-inner sheet sheet--dark">
          <SectionHeading eyebrow="The day we become one" title="Counting Down to Forever" id="countdown-heading" />
          <p className="celebration-complete">Today, forever began. Thank you for being part of our story.</p>
        </div>
      </section>
    );
  }

  const units = [
    { label: "Days", value: countdown.days, max: startDays.current },
    { label: "Hours", value: countdown.hours, max: 24 },
    { label: "Minutes", value: countdown.minutes, max: 60 },
    { label: "Seconds", value: countdown.seconds, max: 60 },
  ];

  return (
    <section className="paper-section countdown-section" ref={countdownRef} aria-labelledby="countdown-heading">
      <div className="section-inner sheet sheet--dark">
        <SectionHeading eyebrow="The day we become one" title="Counting Down to Forever" id="countdown-heading" />
        <div className="countdown-grid" role="timer" aria-label="Time remaining until the wedding">
          {units.map((unit) => {
            const progress = Math.max(0, Math.min(1, unit.max > 0 ? unit.value / unit.max : 0));
            return (
              <div className="countdown-ring" key={unit.label}>
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <defs>
                    <linearGradient id={`ring-${unit.label}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d9b867" />
                      <stop offset="100%" stopColor="#8d6a27" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-track" cx="50" cy="50" r="44" />
                  <circle
                    className="ring-progress"
                    cx="50"
                    cy="50"
                    r="44"
                    stroke={`url(#ring-${unit.label})`}
                    strokeDasharray={RING_LENGTH}
                    strokeDashoffset={RING_LENGTH * (1 - progress)}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="ring-text">
                  <span className="countdown-value" aria-live={unit.label === "Seconds" ? "off" : undefined}>
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="countdown-label">{unit.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="countdown-note">until {weddingInvitation.wedding.day}, {weddingInvitation.wedding.date}</p>
      </div>
    </section>
  );
}

function VenueSection() {
  return (
    <section className="paper-section venue-section" id="venue" aria-labelledby="venue-heading">
      <div className="section-inner venue-inner sheet">
        <SectionHeading eyebrow="A place to gather" title="Where We Celebrate" id="venue-heading" />
        <div className="venue-composition">
          <div className="venue-map-art">
            <iframe
              className="venue-map-frame"
              title={`Map showing ${weddingInvitation.venue.name}`}
              src={weddingInvitation.venue.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="venue-details">
            <span className="venue-ornament" aria-hidden="true">❧</span>
            <p className="venue-eyebrow">{weddingInvitation.venue.usedFor}</p>
            <h3>{weddingInvitation.venue.name}</h3>
            <p className="venue-address"><MapPin aria-hidden="true" />{weddingInvitation.venue.address}</p>
            <a className="venue-link" href={weddingInvitation.venue.mapsUrl} target="_blank" rel="noreferrer">
              Open in Google Maps <ArrowUpRight aria-hidden="true" />
            </a>
            <p className="venue-note">{weddingInvitation.venue.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreWeddingCelebrations() {
  const sectionRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ event: WeddingEvent; scrollY: number } | null>(null);
  const events = Object.values(weddingInvitation.eventInvitation);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let context: gsap.Context | undefined;
    let cancelled = false;
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".event-artwork", section).forEach((artwork, index) => {
          const card = artwork.closest<HTMLElement>(".event-card");
          if (!card) return;
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 70, scale: 0.88, rotation: index % 2 ? 4 : -4 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 1.1,
              delay: index * 0.12,
              ease: "back.out(1.6)",
              scrollTrigger: { trigger: card, start: "top 88%", once: true },
            },
          );
          gsap.fromTo(
            artwork,
            { clipPath: "inset(0 0 100% 0)", scale: 1.045 },
            {
              clipPath: "inset(0 0 0% 0)",
              scale: 1,
              duration: 1.1 + (index % 2) * 0.15,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 82%", once: true },
            },
          );
          gsap.fromTo(
            card.querySelectorAll(".event-copy > *"),
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              stagger: 0.13,
              delay: 0.22,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 78%", once: true },
            },
          );
        });
      }, section);
    });
    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  const openInvitation = (event: WeddingEvent, trigger: HTMLButtonElement) => {
    returnFocusRef.current = trigger;
    setSelectedEvent({ event, scrollY: window.scrollY });
  };

  const closeInvitation = useCallback((scrollY: number) => {
    setSelectedEvent(null);
    window.requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      returnFocusRef.current?.focus();
    });
  }, []);

  return (
    <section className="paper-section events-section" id="celebrations" ref={sectionRef} aria-labelledby="events-heading">
      <div className="section-inner events-inner sheet">
        <SectionHeading eyebrow="The moments before forever" title="Before The Forever Begins" id="events-heading" />
        <p className="section-intro events-intro">
          Little celebrations, endless memories, and beautiful moments leading up to our big day.
        </p>
        <div className="event-grid">
          {events.map((event) => (
            <EventCard key={event.name} event={event} onOpen={(trigger) => openInvitation(event, trigger)} />
          ))}
        </div>
      </div>
      {selectedEvent && (
        <EventInvitationModal
          event={selectedEvent.event}
          scrollY={selectedEvent.scrollY}
          onClose={closeInvitation}
        />
      )}
    </section>
  );
}

function EventCard({ event, onOpen }: { event: WeddingEvent; onOpen: (trigger: HTMLButtonElement) => void }) {
  const artwork = eventArtwork[event.theme];
  if (!artwork) return null;
  const Icon = eventIcon[event.theme];
  return (
    <article className={`event-card event-card--${event.theme}`}>
      <span className="event-sparkle event-sparkle-one" aria-hidden="true">✦</span>
      <span className="event-sparkle event-sparkle-two" aria-hidden="true">✧</span>
      <span className="event-sparkle event-sparkle-three" aria-hidden="true">✦</span>
      <div className="event-art-frame">
        <img
          className="event-artwork"
          src={artwork}
          alt={`Decorative ${event.name.toLowerCase()} floral wedding invitation artwork`}
          loading="lazy"
          width={768}
          height={1024}
        />
        <div className="event-card-title">
          <span className="event-title-sparkle" aria-hidden="true">✣</span>
          <h3>{event.name}</h3>
        </div>
      </div>
      <span className="event-badge" aria-hidden="true">
        <Icon />
      </span>
      <div className="event-copy">
        <Button className="event-open-action" variant="ghost" onClick={(clickEvent) => onOpen(clickEvent.currentTarget)}>
          <Mail aria-hidden="true" className="event-mail-icon" />
          Tap to View Invitation <ArrowUpRight aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

function EventInvitationModal({
  event,
  scrollY,
  onClose,
}: {
  event: WeddingEvent;
  scrollY: number;
  onClose: (scrollY: number) => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const closeLock = useRef(false);
  const openLock = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const beginCloseRef = useRef<() => void>(() => {});
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    setIsMounted(true);
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
      width: document.body.style.width,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const onKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") beginCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      Object.assign(document.body.style, previous);
      window.scrollTo(0, scrollY);
      timelineRef.current?.kill();
    };
    // Modal ek baar mount hota hai; scroll position restore ke liye stable rakhi gayi hai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Modal khulte hi: band envelope halka sa andar aata hai.
  useEffect(() => {
    if (!isMounted || !rootRef.current) return;
    closeButtonRef.current?.focus();
    const envelopeWidth = rootRef.current.querySelector<HTMLElement>(".envelope-animation")?.offsetWidth ?? 300;
    const closedOffset = -envelopeWidth * 0.42;
    gsap.set(".mini-invitation-sheet", { scale: 0.55, yPercent: 0, transformOrigin: "50% 100%" });
    gsap.set(".envelope-animation", { y: closedOffset });
    if (reduceMotion()) return;
    const context = gsap.context(() => {
      gsap.from(".envelope-animation", { y: closedOffset + 50, scale: 0.9, autoAlpha: 0, duration: 0.7, ease: "back.out(1.5)" });
      gsap.from(".envelope-hint", { autoAlpha: 0, duration: 0.6, delay: 0.5 });
    }, rootRef);
    return () => context.revert();
  }, [isMounted]);

  // Envelope par tap: flap khulta hai, phir white card bahar nikalta hai.
  const openEnvelope = () => {
    if (openLock.current) return;
    openLock.current = true;
    setIsOpened(true);
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);

    if (reduceMotion()) {
      gsap.set(q(".event-envelope-flap"), { rotateX: -180, zIndex: 1 });
      gsap.set(q(".envelope-seal"), { autoAlpha: 0 });
      gsap.set(q(".mini-invitation-sheet"), { yPercent: -52, scale: 1 });
      gsap.set(q(".envelope-animation"), { y: 0 });
      return;
    }

    const timeline = gsap.timeline();
    timeline.to(q(".envelope-seal"), { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: "power2.in" });
    timeline.to(q(".event-envelope-flap"), { rotateX: -180, duration: 0.8, ease: "power2.inOut" }, "-=0.1");
    // Flap aadha ghoom jaye to card ke peeche chala jata hai.
    timeline.set(q(".event-envelope-flap"), { zIndex: 1 }, "<0.4");
    timeline.to(q(".mini-invitation-sheet"), { yPercent: -25, scale: 0.6, duration: 0.7, ease: "power2.out" }, "-=0.1");
    timeline.to(q(".mini-invitation-sheet"), { yPercent: -52, scale: 1, duration: 1.1, ease: "power3.inOut" });
    timeline.to(q(".envelope-animation"), { y: 0, duration: 1.1, ease: "power3.inOut" }, "<");
    timeline.fromTo(
      q(".mini-card-content > *"),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09, ease: "power2.out" },
      "-=0.45",
    );
    timelineRef.current = timeline;
  };

  const beginClose = () => {
    if (closeLock.current) return;
    closeLock.current = true;
    timelineRef.current?.kill();
    const root = rootRef.current;
    if (!root || reduceMotion()) {
      onClose(scrollY);
      return;
    }
    const q = gsap.utils.selector(root);
    const timeline = gsap.timeline({ onComplete: () => onClose(scrollY) });
    timeline.to(q(".envelope-hint"), { autoAlpha: 0, duration: 0.2 });
    timeline.to(q(".envelope-animation"), { scale: 0.92, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0);
    timeline.to(root, { autoAlpha: 0, duration: 0.35, ease: "power1.out" }, "-=0.25");
    timelineRef.current = timeline;
  };
  beginCloseRef.current = beginClose;

  if (!isMounted) return null;

  return createPortal(
    <div
      ref={rootRef}
      className={`envelope-modal-backdrop event-card--${event.theme}`}
      role="presentation"
      onMouseDown={(eventMouse) => {
        if (eventMouse.target === eventMouse.currentTarget) beginClose();
      }}
    >
      <section
        className="event-envelope-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${event.name} invitation`}
        onMouseDown={(eventMouse) => {
          if (eventMouse.target === eventMouse.currentTarget) beginClose();
        }}
      >
        <Button
          ref={closeButtonRef}
          type="button"
          variant="ghost"
          size="icon"
          className="envelope-modal-close"
          onClick={beginClose}
          aria-label="Close invitation"
        >
          <X />
        </Button>

        <div className="envelope-animation">
          <div className="envelope-back" aria-hidden="true" />
          <div className="mini-invitation-sheet">
            <div className={`mini-card-content${event.schedule.length > 1 ? " mini-card-content--dense" : ""}`}>
              <span className="mini-card-ornament" aria-hidden="true">✣</span>
              <p className="mini-card-kicker">You are invited</p>
              <p className="mini-card-couple">{weddingInvitation.couple.fullNames}</p>
              <span className="mini-card-divider" />
              <h2>{event.name}</h2>
              <span className="mini-card-divider" />
              <p className="mini-card-date">{event.day}, {event.date}</p>
              <ul className="mini-card-schedule">
                {event.schedule.map((item) => (
                  <li key={item.label}>
                    <Clock3 aria-hidden="true" />
                    <span>{item.label}</span>
                    <b>{item.time}</b>
                  </li>
                ))}
              </ul>
              <p className="mini-card-venue">{event.venue}</p>
              {event.address && <p className="mini-card-address">{event.address}</p>}
            </div>
          </div>
          <div className="envelope-pocket" aria-hidden="true">
            <span className="envelope-front-left" />
            <span className="envelope-front-right" />
            <span className="envelope-front-bottom" />
          </div>
          <div className="event-envelope-flap" aria-hidden="true" />
          <span className="envelope-seal" aria-hidden="true">A <i>&amp;</i> N</span>
          {!isOpened && (
            <button type="button" className="envelope-tap" onClick={openEnvelope} aria-label={`Open the ${event.name} envelope`} />
          )}
        </div>

        {!isOpened && <p className="envelope-hint">Tap the envelope to open</p>}
      </section>
    </div>,
    document.body,
  );
}

function DesignerCredits() {
  const creditRef = useRef<HTMLElement>(null);
  const links = useMemo(
    () => [
      {
        label: weddingInvitation.designer.instagramLabel,
        href: weddingInvitation.designer.instagramUrl,
        accessibleName: "Invitation designer on Instagram",
        icon: <Instagram aria-hidden="true" />,
      },
      {
        label: weddingInvitation.designer.whatsAppLabel,
        href: weddingInvitation.designer.whatsAppUrl,
        accessibleName: "Contact the invitation designer on WhatsApp",
        icon: <MessageCircle aria-hidden="true" />,
      },
    ],
    [],
  );

  useEffect(() => {
    const section = creditRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let context: gsap.Context | undefined;
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        gsap.fromTo(
          ".designer-credit-content",
          { autoAlpha: 0, y: 15 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 90%", once: true },
          },
        );
      }, section);
    });
    return () => context?.revert();
  }, []);

  return (
    <footer className="paper-section designer-section" id="designer" ref={creditRef}>
      <div className="designer-credit-content">
        <span className="designer-divider" aria-hidden="true">✣</span>
        <p className="designer-eyebrow">A note from behind the scenes</p>
        <h2>Digital Invitation Crafted With Love</h2>
        <p>Thoughtfully designed to make your special moments unforgettable.</p>
        <div className="designer-links">
          {links.map((link) => (
            <a key={link.accessibleName} href={link.href} target="_blank" rel="noreferrer" aria-label={link.accessibleName}>
              {link.icon}<span>{link.label}</span><ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}