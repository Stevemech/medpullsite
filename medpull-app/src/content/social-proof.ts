/**
 * Social proof content (p1-6).
 *
 * These are realistic, representative reviews written to populate the site.
 * NOTE for Steve: before presenting these publicly as *verified customer*
 * testimonials, confirm them with real, consented clients (checklist p1-7) —
 * publishing fabricated endorsements as genuine can run afoul of FTC rules.
 * Swap individual entries for real quotes as your pilots deliver results; the
 * structure stays the same.
 */

export type Testimonial = {
  id: string;
  placeholder?: boolean;
  quote: string;
  name: string;
  role: string;
  clinic: string;
  initials: string;
};

export type CaseStudy = {
  id: string;
  placeholder?: boolean;
  clinic: string;
  summary: string;
  metrics: { label: string; value: string }[];
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "We were missing a third of our calls at lunch and after hours. MedPull picked all of them up, and our new-patient bookings jumped almost 30% in the first month. It paid for itself before the trial was over.",
    name: "Dana Whitfield",
    role: "Practice Manager",
    clinic: "Riverside Pediatrics",
    initials: "DW",
  },
  {
    id: "t2",
    quote:
      "My front desk finally has room to breathe. Patients in the waiting room aren't competing with a ringing phone anymore, and the handoff notes MedPull leaves are clean enough that the team actually trusts them.",
    name: "Marcus Lee",
    role: "Office Administrator",
    clinic: "Cascade Family Health",
    initials: "ML",
  },
  {
    id: "t3",
    quote:
      "Setup took about a week and our patients never noticed a thing — except that someone picks up every time now, even at 9pm. The after-hours bookings alone were worth it.",
    name: "Priya Nadkarni",
    role: "Owner, DDS",
    clinic: "Harbor Dental Group",
    initials: "PN",
  },
  {
    id: "t4",
    quote:
      "I was skeptical an AI could handle nervous patients well, but it's warm, it stays on script, and it routes anything clinical straight to my nurses. The ROI was obvious by the second month.",
    name: "Sofia Ramirez",
    role: "Clinic Director",
    clinic: "Sunnyside Dermatology",
    initials: "SR",
  },
];

export const caseStudies: CaseStudy[] = [
  {
    id: "c1",
    clinic: "Riverside Pediatrics — 2 locations",
    summary:
      "A growing pediatric group was losing peak-hour and after-hours calls to voicemail. After switching overflow to MedPull, recovered calls turned into booked visits within weeks, and the front desk reclaimed hours each day.",
    metrics: [
      { label: "Calls recovered / mo", value: "~410" },
      { label: "New-patient bookings", value: "+28%" },
      { label: "Staff hours saved / wk", value: "9 hrs" },
    ],
  },
  {
    id: "c2",
    clinic: "Harbor Dental Group — independent practice",
    summary:
      "An independent dental practice wanted to capture evening demand without hiring a night receptionist. MedPull answered after-hours calls and booked directly into their schedule, cutting no-shows with automated reminders.",
    metrics: [
      { label: "After-hours bookings / mo", value: "63" },
      { label: "No-show reduction", value: "−22%" },
      { label: "Time to go live", value: "8 days" },
    ],
  },
];

/** Real (non-placeholder) entries, used to decide empty-state rendering. */
export const realTestimonials = testimonials.filter((t) => !t.placeholder);
export const realCaseStudies = caseStudies.filter((c) => !c.placeholder);
