import { describe, expect, it } from "vitest";

import { getWeddingCountdown, weddingInvitation } from "@/lib/wedding-invitation-data";

describe("the invitation's editable demonstration details", () => {
  it("uses the bride and groom names", () => {
    expect(weddingInvitation.couple.fullNames).toBe("Asiya & Nabeel");
  });

  it("uses the requested wedding date and Karachi-local start time", () => {
    expect(weddingInvitation.wedding.isoDateTime).toBe("2026-12-12T10:00:00+05:00");
  });

  it("calculates the live countdown from the requested Karachi wedding time", () => {
    expect(getWeddingCountdown(weddingInvitation.wedding.isoDateTime, Date.parse("2026-12-12T04:59:00Z"))).toEqual({
      complete: false,
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 0,
    });
  });

  it("marks the celebration complete once its date has passed", () => {
    expect(getWeddingCountdown(weddingInvitation.wedding.isoDateTime, Date.parse("2026-12-12T05:00:00Z")).complete).toBe(true);
  });

  it("provides the requested venue address and map destination", () => {
    expect(weddingInvitation.venue.address).toBe("Pensra Road, Gojra, Pakistan");
    expect(weddingInvitation.venue.mapsUrl).toContain("google.com/maps/search");
  });

  it("includes all four dated celebrations", () => {
    expect(Object.keys(weddingInvitation.eventInvitation)).toEqual(["mayun", "mehndi", "baraat", "walima"]);
    expect(weddingInvitation.eventInvitation.walima.date).toBe("13 December 2026");
  });

  it("keeps designer contact destinations editable in the central invitation data", () => {
    expect(weddingInvitation.designer.instagramLabel).toMatch(/^@/);
    expect(weddingInvitation.designer.whatsAppLabel).toContain("+");
  });
});