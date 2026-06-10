#!/usr/bin/env tsx
/**
 * Seeds a couple of PLACEHOLDER interns with referral codes (p5-1/p5-2) so the
 * intern dashboard and referral flow can be demoed locally.
 *
 *   npm run seed:interns
 *
 * TODO(steve): replace with real interns and codes (checklist p0-7).
 */
import { prisma } from "../src/lib/db";

const PLACEHOLDER_INTERNS = [
  { name: "Alex Intern (PLACEHOLDER)", email: "alex@interns.example", referralCode: "ALEX2026" },
  { name: "Sam Intern (PLACEHOLDER)", email: "sam@interns.example", referralCode: "SAM2026" },
];

async function main() {
  for (const i of PLACEHOLDER_INTERNS) {
    const intern = await prisma.intern.upsert({
      where: { email: i.email },
      update: { name: i.name, referralCode: i.referralCode, active: true },
      create: i,
    });
    console.log(`seeded intern ${intern.name} → code ${intern.referralCode} (id ${intern.id})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
