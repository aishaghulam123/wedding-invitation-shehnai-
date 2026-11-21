// ✏️  Yahan se poori invitation ki details edit karein — baqi code ko chhoone ki zaroorat nahi.

export type EventScheduleItem = { label: string; time: string };

export type WeddingEvent = {
  name: string;
  theme: "mayun" | "mehndi" | "baraat" | "walima";
  day: string;
  date: string;
  /** Card par ek line mein dikhne wala time (summary). */
  time: string;
  /** Din ka poora program (modal ke card mein dikhta hai). */
  schedule: EventScheduleItem[];
  venue: string;
  address: string;
  description: string;
};

export type CountdownParts = {
  complete: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const weddingInvitation = {
  couple: {
    bride: "Asiya",
    groom: "Nabeel",
    fullNames: "Asiya & Nabeel",
    monogram: "A & N",
    brideFullName: "Asiya Mehmood",
    brideParent: "Muhammad Mehmood",
    groomFullName: "Muhammad Nabeel Tahir",
    groomParent: "Tahir Rasheed",
  },
  wedding: {
    event: "Wedding Celebration",
    day: "Saturday",
    date: "12 December 2026",
    time: "Baraat Departure · 10:00 AM",
    // Pakistan time (UTC+05:00). Countdown isi se chalta hai.
    isoDateTime: "2026-12-12T10:00:00+05:00",
  },
  venue: {
    name: "Tayyab Marriage Hall",
    address: "Pensra Road, Gojra, Pakistan",
    // Location section mein dikhne wali lines
    usedFor: "Venue for Mehndi & Walima",
    note: "Baraat departs from the groom's home at 10:00 AM.",
    // Google Maps search link + embedded map dono isi query se bante hain.
    mapsQuery: "Tayyab Marriage Hall, Pensra Road, Gojra, Pakistan",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Tayyab%20Marriage%20Hall%2C%20Pensra%20Road%2C%20Gojra%2C%20Pakistan",
    mapsEmbedUrl: "https://www.google.com/maps?q=Tayyab%20Marriage%20Hall%2C%20Pensra%20Road%2C%20Gojra%2C%20Pakistan&output=embed",
  },
  eventInvitation: {
    mayun: {
      name: "Mayun",
      theme: "mayun",
      day: "Wednesday",
      date: "9 December 2026",
      time: "6:00 PM",
      schedule: [{ label: "Mayun begins", time: "6:00 PM" }],
      venue: "At Home",
      address: "",
      description: "Turmeric, marigolds and laughter as the celebrations begin.",
    },
    mehndi: {
      name: "Mehndi",
      theme: "mehndi",
      day: "Thursday",
      date: "10 December 2026",
      time: "6:00 PM",
      schedule: [
        { label: "Mehndi", time: "6:00 PM" },
        { label: "Dinner", time: "7:30 PM" },
        { label: "Qawali Night", time: "After Dinner" },
      ],
      venue: "Tayyab Marriage Hall",
      address: "Pensra Road, Gojra",
      description: "An evening of henna, dinner and a magical qawali night.",
    },
    baraat: {
      name: "Baraat",
      theme: "baraat",
      day: "Saturday",
      date: "12 December 2026",
      time: "10:00 AM",
      schedule: [{ label: "Baraat departs from home", time: "10:00 AM" }],
      venue: "Groom's Home",
      address: "",
      description: "The grand arrival and the heart of our celebration.",
    },
    walima: {
      name: "Walima",
      theme: "walima",
      day: "Sunday",
      date: "13 December 2026",
      time: "1:00 PM",
      schedule: [{ label: "Walima Lunch", time: "1:00 PM" }],
      venue: "Tayyab Marriage Hall",
      address: "Pensra Road, Gojra",
      description: "A graceful lunch to bless the newlyweds with your presence.",
    },
  } satisfies Record<string, WeddingEvent>,
  designer: {
    // ✏️  Apne asli links yahan lagayein.
    instagramLabel: "@digital_invites_bymili",
    whatsAppLabel: "Digital Invites by Mili",
    instagramUrl: "https://www.instagram.com/digital_invites_bymili/",
    whatsAppUrl: "https://api.whatsapp.com/message/N24AWOP5IQURG1?autoload=1&app_absent=0",
  },
};

export function getWeddingCountdown(isoDateTime: string, now: number = Date.now()): CountdownParts {
  const remaining = Date.parse(isoDateTime) - now;
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return { complete: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const total = Math.floor(remaining / 1000);
  return {
    complete: false,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
