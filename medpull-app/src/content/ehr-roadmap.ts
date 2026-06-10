/**
 * EHR integration roadmap content (p1-8).
 *
 * Status reflects where each integration stands. Timeframes are deliberately
 * non-committal (no fixed public dates) until partnership/certification
 * timelines are confirmed — see the "Needs Steve" notes in SUMMARY.md.
 */

export type RoadmapStatus = "live" | "in-progress" | "planned" | "exploring";

export type RoadmapItem = {
  id: string;
  system: string;
  status: RoadmapStatus;
  timeframe: string;
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
    timeframe: "Available today",
    scope: "Book and reschedule against a connected calendar (e.g. Cal.com or Google Calendar).",
    details: [
      "Round-robin and per-provider availability rules.",
      "Confirmations and reminders sent automatically.",
    ],
  },
  {
    id: "athenahealth",
    system: "athenahealth",
    status: "in-progress",
    timeframe: "On the near-term roadmap",
    scope: "Two-way appointment sync and patient lookup via athenahealth's developer APIs.",
    details: [
      "Scheduling first, with demographics on the roadmap.",
      "Sandbox integration ahead of pilot expansion.",
    ],
  },
  {
    id: "epic",
    system: "Epic",
    status: "planned",
    timeframe: "Planned",
    scope: "Scheduling and patient context through Epic's app integration program.",
    details: [
      "FHIR-based scheduling (Appointment, Slot, Patient).",
      "Rolled out with a design-partner clinic first.",
    ],
  },
  {
    id: "others",
    system: "Other systems",
    status: "exploring",
    timeframe: "Demand-driven",
    scope: "eClinicalWorks, NextGen, Practice Fusion, and others — prioritized by pilot demand.",
    details: ["Tell us what you run and we'll factor it into the roadmap."],
  },
];
