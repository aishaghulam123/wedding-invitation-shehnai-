import portraitCover from "@/assets/elegant-sage-monogram-seal.png";
import portraitVideo from "@/assets/gold-curtains-opening.mp4";

// Optional laptop/desktop (landscape) files: src/assets/landscape/cover.(png|jpg|webp) aur video.mp4
const landscapeCovers = import.meta.glob("../assets/landscape/cover.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const landscapeVideos = import.meta.glob("../assets/landscape/video.mp4", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const landscapeCover = Object.values(landscapeCovers)[0];
const landscapeVideo = Object.values(landscapeVideos)[0];
export const hasLandscapeAssets = Boolean(landscapeCover && landscapeVideo);

/** Seal ki position/size: x,y = seal ka center (image ka %), size = seal ki chaudai (image width ka %). */
export const stageAssets = {
  portrait: {
    cover: portraitCover,
    video: portraitVideo,
    ratio: 9 / 16,
    seal: { x: 50, y: 48.3, size: 45 },
  },
  landscape: {
    cover: landscapeCover ?? portraitCover,
    video: landscapeVideo ?? portraitVideo,
    ratio: 16 / 9,
    seal: { x: 50, y: 49.3, size: 24.5 },
  },
};

export type StageKind = "portrait" | "landscape";

export function resolveStage(width: number, height: number, frozenKind?: StageKind) {
  const viewportRatio = width / Math.max(height, 1);
  const kind: StageKind = frozenKind ?? (viewportRatio >= 1 && hasLandscapeAssets ? "landscape" : "portrait");
  const asset = stageAssets[kind];
  // Agar viewport asset se bohat alag shape ka ho to cover ki jagah contain (warna bohat crop hota hai).
  const mismatch = viewportRatio / asset.ratio;
  const fit: "cover" | "contain" = mismatch > 1.6 || mismatch < 0.6 ? "contain" : "cover";
  const sealRadiusOfHeight = (asset.seal.size * asset.ratio) / 2;
  return { kind, fit, ...asset, tapY: asset.seal.y + sealRadiusOfHeight + 3 };
}
