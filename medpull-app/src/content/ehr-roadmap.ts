/**
 * EHR integration roadmap content (p1-8).
 *
 * All timelines, scope, and statuses below are PLACEHOLDERS.
 * TODO(steve): replace with the real roadmap written under checklist task p0-9
 * (Epic + athenahealth timelines and scope). Do not present these dates as
 * commitments until confirmed.
 */

export type RoadmapStatus = "live" | "in-progress" | "planned" | "exploring";

export type RoadmapItem = {
  id: string;
  system: string;
  status: RoadmapStatus;
  timeframe: string; // placeholder window
  scope: string;
  details: string[];
};

export const statusLabels: Record<RoadmapStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  planned: "Planned",
  exploring: "Exploring",
};

export const roadmap: RoadmapItem[] = [
  {
    id: "calendar",
    system: "Calendar-based scheduling",
    status: "live",
    timeframe: "Available today (placeholder)",
    scope: "Book and reschedule against a connected calendar (e.g. Cal.com/Google).",
    details: [
      "TODO(steve): confirm which calendar providers are supported at launch.",
      "Round-robin and per-provider availability rules.",
    ],
  },
  {
    id: "athenahealth",
    system: "athenahealth",
    status: "in-progress",
    timeframe: "Target: H1 2026 (placeholder)",
    scope: "Two-way appointment sync and patient lookup via athenahealth APIs.",
    details: [
      "TODO(steve): confirm API program enrollment and certification timeline.",
      "TODO(steve): define scope — scheduling only, or demographics + insurance.",
      "Placeholder milestone: sandbox integration before pilot expansion.",
    ],
  },
  {
    id: "epic",
    system: "Epic",
    status: "planned",
    timeframe: "Target: H2 2026 (placeholder)",
    scope: "Scheduling and patient context via Epic's App Orchard / Vendor Services.",
    details: [
      "TODO(steve): confirm Epic partnership path and review timeline.",
      "TODO(steve): scope FHIR resources required (Appointment, Slot, Patient).",
      "Placeholder milestone: design partner clinic for first Epic rollout.",
    ],
  },
  {
    id: "others",
    system: "Other systems",
    status: "exploring",
    timeframe: "Demand-driven (placeholder)",
    scope: "eClinicalWorks, NextGen, Practice Fusion, and others by pilot demand.",
    details: ["TODO(steve): prioritize based on pilot clinic systems (see intake p4-3 data)."],
  },
];
