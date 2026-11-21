import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { gsap } from "gsap";

import { InvitationSections, ScrollInvitationIndicator } from "@/components/invitation/InvitationSections";
import { advanceOpeningState, type WeddingOpeningState } from "@/lib/wedding-opening-state";
import { weddingInvitation } from "@/lib/wedding-invitation-data";
import { SHARE, SITE_URL } from "@/lib/site";
import { resolveStage, type StageKind } from "@/lib/stage-assets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SHARE.title },
      { name: "description", content: SHARE.description },
      { property: "og:site_name", content: "Wedding Invitation" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:title", content: SHARE.title },
      { property: "og:description", content: SHARE.description },
      { property: "og:image", content: SHARE.image },
      { property: "og:image:secure_url", content: SHARE.image },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: SHARE.imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHARE.title },
      { name: "twitter:description", content: SHARE.description },
      { name: "twitter:image", content: SHARE.image },
      { name: "theme-color", content: "#e9d9b4" },
    ],
  }),
  component: InvitationOpening,
});

function InvitationOpening() {
  const [state, setState] = useState<WeddingOpeningState>("sealed");
  const [namesAnimationComplete, setNamesAnimationComplete] = useState(false);
  const started = useRef(false);
  const openingTimeline = useRef<gsap.core.Timeline | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropRef = useRef<HTMLVideoElement>(null);
  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const frozenKind = useRef<StageKind | undefined>(undefined);
  const sealRef = useRef<HTMLButtonElement>(null);
  const crackRef = useRef<SVGSVGElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Opening shuru hone ke baad video/image ka version badalta nahi (video restart na ho).
  if (state !== "sealed" && !frozenKind.current) {
    frozenKind.current = resolveStage(viewport.width, viewport.height).kind;
  }
  const stage = resolveStage(viewport.width, viewport.height, frozenKind.current);

  // Scroll par halka veil aata hai, taake text padhna aasan ho (background wahi rehta hai).
  useEffect(() => {
    if (!namesAnimationComplete) return;
    const onScroll = () => {
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
      document.documentElement.style.setProperty("--veil", progress.toFixed(3));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.removeProperty("--veil");
    };
  }, [namesAnimationComplete]);

  // Jab tak video khatam hokar naam animate nahi ho jate, page scroll nahi hoga.
  useEffect(() => {
    const locked = !namesAnimationComplete;
    document.documentElement.classList.toggle("scroll-locked", locked);
    document.body.classList.toggle("scroll-locked", locked);
    if (locked) window.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove("scroll-locked");
      document.body.classList.remove("scroll-locked");
    };
  }, [namesAnimationComplete]);

  // Agar browser video play na kar sake to seedha naam dikha do, taake user atak na jaye.
  const skipToNames = useCallback(() => {
    setState((current) => {
      let next = current;
      for (const step of ["curtainPlaying", "curtainComplete", "namesRevealed"] as const) {
        next = advanceOpeningState(next, step);
      }
      return next;
    });
  }, []);

  const openInvitation = useCallback(() => {
    if (started.current || state !== "sealed") return;
    started.current = true;
    setState((current) => advanceOpeningState(current, "breaking"));

    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.currentTime = 0;
      void backdrop.play().catch(() => undefined);
    }
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => {
        video.pause();
        video.currentTime = 0;
        window.setTimeout(skipToNames, 900);
      });
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        setState((current) => advanceOpeningState(current, "curtainPlaying"));
      },
    });

    timeline.to(sealRef.current, {
      scale: 0.92,
      duration: 0.2,
      ease: "power2.in",
      transformOrigin: "center center",
      filter: "drop-shadow(0 0.25rem 0.35rem rgb(24 32 18 / 55%))",
    });
    timeline.to(crackRef.current?.querySelectorAll("path") ?? [], {
      opacity: 0.78,
      duration: 0.18,
      stagger: 0.035,
      ease: "power1.out",
    });
    timeline.to(
      ".wax-shard",
      {
        opacity: 0,
        x: (index) => (index % 2 ? 18 : -18),
        y: (index) => (index % 3 ? -16 : 14),
        rotation: (index) => (index % 2 ? 24 : -22),
        duration: 0.46,
        stagger: 0.025,
        ease: "power2.in",
      },
      "-=0.06",
    );
    timeline.to(
      ".invitation-cover",
      { opacity: 0, duration: 0.55, ease: "power1.inOut" },
      "-=0.24",
    );
    openingTimeline.current = timeline;
  }, [state, skipToNames]);

  useEffect(() => {
    return () => {
      openingTimeline.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (state !== "namesRevealed" || !namesRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setNamesAnimationComplete(true);
      return;
    }
    const timeline = gsap.timeline();
    timeline.fromTo(
      ".reveal-intro",
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.95, ease: "power2.out" },
    );
    timeline.fromTo(
      ".reveal-name",
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 1.25, stagger: 0.38, ease: "power2.out" },
      "-=0.15",
    );
    timeline.fromTo(
      ".reveal-divider, .reveal-married",
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.25, ease: "power2.out" },
      "-=0.3",
    );
    timeline.add(() => setNamesAnimationComplete(true));
    return () => {
      timeline.kill();
    };
  }, [state]);

  const onCurtainEnded = useCallback(() => {
    setState((current) => advanceOpeningState(current, "curtainComplete"));
    requestAnimationFrame(() => {
      setState((current) => advanceOpeningState(current, "namesRevealed"));
    });
  }, []);

  const showNames = state === "namesRevealed";

  return (
    <>
      <div
        className={`stage-fixed fit-${stage.fit} invitation-state-${state}`}
        style={
          {
            "--ratio": stage.ratio,
            "--seal-x": `${stage.seal.x}%`,
            "--seal-y": `${stage.seal.y}%`,
            "--seal-size": `${stage.seal.size}%`,
            "--tap-y": `${stage.tapY}%`,
          } as CSSProperties
        }
      >
        <div className="video-backdrop" aria-hidden="true">
          <video ref={backdropRef} muted playsInline preload="auto" src={stage.video} />
        </div>

        <div className="stage-box">
          <video
            ref={videoRef}
            className="curtain-film"
            src={stage.video}
            poster={stage.cover}
            muted
            playsInline
            preload="auto"
            onEnded={onCurtainEnded}
            onError={skipToNames}
            aria-label="Champagne curtains opening to a floral wedding setting"
          />

          <section
            className={`invitation-cover${state === "sealed" ? " is-sealed" : " is-opening"}`}
            aria-label="Sealed wedding invitation"
          >
            <img className="cover-artwork" src={stage.cover} alt="Sage-green floral invitation with a champagne-gold A and N seal" />

            <button
              ref={sealRef}
              className="seal-trigger"
              type="button"
              onClick={openInvitation}
              disabled={state !== "sealed"}
              aria-label="Tap to open the invitation"
              aria-hidden={state !== "sealed"}
              tabIndex={state === "sealed" ? 0 : -1}
            >
              <span className="seal-shimmer" aria-hidden="true" />
              <svg ref={crackRef} className="wax-cracks" viewBox="0 0 240 240" aria-hidden="true">
                <path d="M120 116 100 91 106 69 96 53" />
                <path d="m123 117 24-24 5-25 14-13" />
                <path d="m118 124-27 9-16 23-24 9" />
                <path d="m125 122 25 10 12 23 24 6" />
                <path d="m118 128-4 31-16 19-3 24" />
                <path d="m126 128 8 26 18 12 12 22" />
              </svg>
              <span className="wax-shard wax-shard-one" aria-hidden="true" />
              <span className="wax-shard wax-shard-two" aria-hidden="true" />
              <span className="wax-shard wax-shard-three" aria-hidden="true" />
              <span className="wax-shard wax-shard-four" aria-hidden="true" />
            </button>

            {state === "sealed" && (
              <button type="button" className="tap-instruction" onClick={openInvitation} tabIndex={-1} aria-hidden="true">
                <span aria-hidden="true">✦</span> Tap to Open <span aria-hidden="true">✦</span>
              </button>
            )}
          </section>
        </div>
        <div className="stage-veil" aria-hidden="true" />
      </div>

      <main className={`invitation-scene invitation-state-${state}`}>
        {showNames && (
          <div ref={namesRef} className="couple-reveal" aria-live="polite">
            <span className="reveal-glow" aria-hidden="true" />
            <p className="reveal-intro">Together with their families</p>
            <h1 className="reveal-name">{weddingInvitation.couple.bride}</h1>
            <div className="reveal-divider" aria-label="A and N">
              <span />
              <span className="divider-monogram">A <i>&amp;</i> N</span>
              <span />
            </div>
            <h2 className="reveal-name">{weddingInvitation.couple.groom}</h2>
            <p className="reveal-married">Are Getting Married</p>
          </div>
        )}
        {namesAnimationComplete && (
          <div className="opening-discover-rail">
            <ScrollInvitationIndicator visible={namesAnimationComplete} />
          </div>
        )}
      </main>
      {namesAnimationComplete && <InvitationSections />}
    </>
  );
}