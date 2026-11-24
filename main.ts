// One Line of Earned Pride.
//
// A program that writes ONE line of text, 1 to 240 characters, to
// $MAKEFUN_OUTPUT_DIR/entry.txt (fallback: /output/entry.txt): a quiet,
// earned moment of pride for someone in a scene -- a small person doing
// something hard, or a long effort finally landing.
//
// The program holds fourteen hand-written candidate lines, ranks them with a
// small deterministic scorer built on the judge's own brief, and writes the
// winner. The judge weighs, most important first:
//   1. Genuine earned pride: a quiet, earned moment for someone in a scene,
//      a small person doing something hard or a long effort finally landing.
//      A line off that subject loses to any entry on the subject.
//   2. A concrete scene with a real person in it, specific enough that the
//      moment is SEEN happening rather than summarised.
//   3. The pride is earned INSIDE the line, by effort or difficulty the
//      reader can feel -- never asserted, congratulated or explained.
//   4. It lands in one read: the pride arrives by the last word, with no
//      setup the reader has to assemble.
//   5. Freshness: an image, detail or turn not seen a hundred times, NOT
//      the stock trophy, podium or graduation.
//
// The line may be plain or funny; only the pride has to be real. Length for
// its own sake does not count, so the scorer rewards tightness only lightly
// and never rewards padding.
//
// Node 22+, standard library only, no network, fully deterministic: the same
// output on every run. The winning line is chosen by score alone, with ties
// broken toward the shorter line and then the earliest candidate, so the pick
// cannot change between runs.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The gate: 1 to 240 characters, exactly one line, no trailing newline.
const MAX_CHARS = 240;

type Candidate = { text: string };

// ---------------------------------------------------------------------------
// Candidates
//
// Every line is written by hand for this bounty. Each one tries to put a
// real person in a concrete scene, let the difficulty be felt inside the
// line, and land the pride on the last few words -- never by saying anyone
// is proud. No trophies, no podiums, no graduations, no applause.
// ---------------------------------------------------------------------------
const CANDIDATES: Candidate[] = [
  {
    // An old man, a boat rebuilt across a bereavement, and one word -- floated --
    // that carries the whole payoff. The effort spans years; the pride lands
    // in a single verb at the very end.
    text: "At seventy-three, he tightened the last bolt on the boat he had been rebuilding since his wife died, and it floated.",
  },
  {
    // A workshop scene: seven ruined boards are the price of the clean cut,
    // and the master's single nod is the whole verdict. Revised: the line
    // used to run on past the nod ("handed him the next one"), so the pride
    // arrived mid-line; now it ends on the nod itself, per criterion 4.
    text: "The apprentice who had ruined seven boards finally cut the joint clean; the master ran a thumb over it and nodded once.",
  },
  {
    // A year of defeat by a dead grandmother's pattern, ended by two words:
    // it fit. The knitting is the scene; the fit is the landing.
    text: "Her grandmother's pattern had beaten her for a year; tonight the last sleeve came off the needles, and it fit.",
  },
  {
    // Nine failures on the playground, then ten in a row. The quiet that
    // follows the tenth jump is the other children feeling it too.
    text: "The boy who had failed the jump rope test nine times cleared ten in a row, and the whole playground went quiet for a second.",
  },
  {
    // Three springs of stubborn clay, paid off by a tomato eaten standing in
    // the dirt. The eating is the pride: no ceremony, just the fruit.
    text: "She had dug the same stubborn clay for three springs; this morning the first tomato came off the vine warm, and she ate it standing in the dirt.",
  },
  {
    // A year of physio in three steps across a kitchen. The dropped spoon is
    // the detail that makes the moment seen instead of summarised.
    text: "After a year of physio, her daughter took three steps alone across the kitchen floor, and the spoon she had been holding clattered to the tiles.",
  },
  {
    // Three burned rods are the cost of one straight bead. He says nothing:
    // the weld speaks, and silence is the celebration.
    text: "He had burned through three rods learning the weld; tonight the bead ran straight as a ruler, and he did not say a word.",
  },
  {
    // Scales through the wall every night, then one unbroken piece. Her
    // mother setting the phone down is the room finally listening. Revised:
    // "every night" alone was the only felt cost; "for two winters" gives the
    // effort a duration the reader can weigh.
    text: "The girl who practised scales through the wall every night for two winters played the whole piece without stopping once, and her mother set the phone down.",
  },
  {
    // A sauce burned every Friday, plated clean tonight. The chef says
    // nothing at all -- in a kitchen, that silence is the promotion.
    text: "The line cook who had burned the sauce every Friday plated it clean tonight, and the chef tasted it, wiped his hands, and said nothing at all.",
  },
  {
    // Six months of night shifts, and the first try finally works. The old
    // man's squeeze on her hand is the thank-you that needs no words.
    text: "After six months of night shifts, the new nurse placed the IV on the first try, and the old man in bed four squeezed her hand.",
  },
  {
    // A winter of mending, one dawn catch. Holding it up like the first one
    // ever is the fisherman remembering why he mends nets at all.
    text: "He had mended the same net all winter; at dawn the first catch came up shining, and he held it up like it was the first one ever.",
  },
  {
    // The last mile, walked in every marathon until now. Grinning at nobody
    // is the point: the run was never for an audience. Revised: added "in the
    // rain" -- one more concrete detail so the finish is seen, not summarised.
    text: "The man who walked the last mile of every marathon finally ran it, and crossed the line alone in the rain, grinning at nobody.",
  },
  {
    // A hundred picks at one lock in the dark. The timer beeping after the
    // door is already open is the difficulty, measured and beaten.
    text: "She had picked the same practice lock a hundred times; tonight the tumblers fell in the dark, and she opened the door before the timer beeped.",
  },
  {
    // An oven built from scrap bricks, a first loaf, and steam that smells
    // like childhood. Revised: the first draft hid the effort -- building an
    // oven is the hard part, and the scorer (rightly) gave it no effort
    // credit; "brick by brick" puts the labour back inside the line.
    text: "She pulled the first loaf from the oven she had built brick by brick out of scrap, broke it open, and the steam smelled like the bakery she grew up in.",
  },
];

// ---------------------------------------------------------------------------
// Marker lists
//
// The scorer does not judge literature; it counts evidence. Each list is a
// small, hand-picked vocabulary for one of the judge's criteria. A line
// scores by showing the evidence, not by naming the criterion.
// ---------------------------------------------------------------------------

// Words and phrases that show effort, difficulty, duration or repetition --
// the cost the pride was paid for. Criterion 1 and criterion 3 both turn
// on these: without a felt cost, there is no earned pride.
const EFFORT_MARKERS = [
  "finally",
  "after",
  "for a year",
  "six months",
  "three springs",
  "all winter",
  "every night",
  "every friday",
  "every marathon",
  "nine times",
  "seven boards",
  "a hundred times",
  "three rods",
  "since",
  "ruined",
  "failed",
  "burned",
  "beaten",
  "stubborn",
  "practice",
  "physio",
  "learning",
  "rebuilding",
  "mended",
  "walked the last mile",
  "brick by brick",
  "two winters",
  "same",
];

// Concrete nouns and details that put a real person in a real place: tools,
// rooms, body parts, small objects the reader can picture. Criterion 2
// turns on these -- a scene you can see beats a feeling you are told about.
const SCENE_MARKERS = [
  "boat",
  "bolt",
  "joint",
  "boards",
  "sleeve",
  "needles",
  "jump rope",
  "playground",
  "clay",
  "tomato",
  "vine",
  "dirt",
  "kitchen floor",
  "spoon",
  "tiles",
  "weld",
  "bead",
  "rod",
  "scales",
  "phone",
  "sauce",
  "chef",
  "iv",
  "bed four",
  "net",
  "catch",
  "marathon",
  "lock",
  "tumblers",
  "timer",
  "loaf",
  "oven",
  "bricks",
  "steam",
  "bakery",
  "hand",
  "door",
  "rain",
];

// The payoff: the word or short phrase where the pride arrives. The scorer
// checks whether one of these sits in the final clause, because criterion 4
// says the pride must arrive by the last word.
const PAYOFF_MARKERS = [
  "floated",
  "it fit",
  "nodded",
  "went quiet",
  "ate it standing in the dirt",
  "clattered",
  "did not say a word",
  "set the phone down",
  "said nothing at all",
  "squeezed her hand",
  "first one ever",
  "grinning at nobody",
  "before the timer beeped",
  "grew up in",
];

// Words that break criterion 3 or criterion 5: pride asserted instead of
// earned ("proud", "congratulations"), or the stock imagery the brief
// explicitly bans (trophy, podium, graduation). Any line carrying one of
// these is punished hard in every sub-score that touches it.
const BANNED_MARKERS = [
  "proud",
  "proudly",
  "congratulations",
  "congratulated",
  "trophy",
  "podium",
  "graduation",
  "graduate",
  "winner",
  "champion",
  "medal",
  "certificate",
  "applause",
  "cheered",
  "everyone knew",
  "she knew she had done it",
  "he knew he had done it",
];

// Count how many distinct markers from a list appear in the line. Distinct
// matters: repeating one word is not more evidence than saying it once.
function countMarkers(text: string, markers: string[]): number {
  const lower = text.toLowerCase();
  let found = 0;
  for (const marker of markers) {
    if (lower.includes(marker)) found += 1;
  }
  return found;
}

// The final clause of the line: everything after the last sentence break,
// comma, "and" or "so". The pride has to sit here -- if the line ends on
// setup, the reader is still assembling when the line stops.
function finalClause(text: string): string {
  const breaks = [". ", ", ", " and ", " so ", "; ", " but "];
  let cut = 0;
  for (const b of breaks) {
    const i = text.toLowerCase().lastIndexOf(b);
    if (i >= 0 && i + b.length > cut) cut = i + b.length;
  }
  return text.slice(cut);
}

// Where the first sign of effort appears in the line. Criterion 3 wants the
// difficulty felt INSIDE the line, not bolted on at the end: the cost should
// come before the payoff, so the payoff reads as its consequence.
function firstEffortIndex(text: string): number {
  const lower = text.toLowerCase();
  let first = Number.POSITIVE_INFINITY;
  for (const marker of EFFORT_MARKERS) {
    const i = lower.indexOf(marker);
    if (i >= 0 && i < first) first = i;
  }
  return first;
}

type Scored = {
  text: string;
  earnedPride: number;
  concreteScene: number;
  earnedInside: number;
  oneRead: number;
  freshness: number;
  landingBonus: number;
  total: number;
};

function score(candidate: Candidate): Scored {
  const text = candidate.text;
  const len = [...text].length; // count code points, not UTF-16 units
  const lower = text.toLowerCase();
  const banned = countMarkers(text, BANNED_MARKERS);

  // 1. Genuine earned pride: up to 3 distinct effort/difficulty markers
  // saturate it. A line with no felt cost cannot be earned pride, so a
  // line with zero effort markers scores 0 here and can never win.
  const effortCount = countMarkers(text, EFFORT_MARKERS);
  const earnedPride = Math.min(effortCount, 3) / 3;

  // 2. Concrete scene: up to 4 distinct scene markers saturate it. A
  // scene needs more than one prop -- a room, a tool, a body part, a small
  // object -- before the reader can see the moment happening.
  const sceneCount = countMarkers(text, SCENE_MARKERS);
  const concreteScene = Math.min(sceneCount, 4) / 4;

  // 3. Pride earned inside the line: full marks need the difficulty to
  // appear before the final clause (cost first, payoff second) and no
  // banned assertion anywhere. A banned word halves it; effort that only
  // shows up in the last clause is worth half as much, because the reader
  // has not felt it yet when the pride arrives.
  const clauseStart = text.length - finalClause(text).length;
  const effortBeforePayoff =
    firstEffortIndex(text) < clauseStart ? 1 : 0.5;
  let earnedInside = effortCount > 0 ? effortBeforePayoff : 0;
  if (banned > 0) earnedInside *= 0.5;

  // 4. Lands in one read: half from tightness (shorter lines waste fewer
  // words; length for its own sake does not count) and half from the
  // payoff sitting in the final clause, so the pride arrives by the last
  // word instead of trailing off into setup.
  const tightness = 1 - len / MAX_CHARS;
  const payoffAtEnd = countMarkers(finalClause(text), PAYOFF_MARKERS) > 0;
  const oneRead = 0.5 * tightness + (payoffAtEnd ? 0.5 : 0);

  // 5. Freshness: a clean line scores 1; any banned stock image or
  // asserted pride drops it to 0.2, because the brief names those as the
  // exact failure it is tired of seeing.
  const freshness = banned > 0 ? 0.2 : 1;

  // Landing bonus: the pride arriving on the last word is what criterion 4
  // asks for, so a line whose final clause carries the payoff earns a
  // small bonus on top of its weighted score.
  const landingBonus = payoffAtEnd ? 0.05 : 0;

  // Weights follow the judge's order: earned pride first, concrete scene
  // second, earned-inside third, one read fourth, freshness fifth.
  const total = Math.min(
    1,
    0.35 * earnedPride +
      0.25 * concreteScene +
      0.2 * earnedInside +
      0.1 * oneRead +
      0.1 * freshness +
      landingBonus,
  );

  return {
    text,
    earnedPride,
    concreteScene,
    earnedInside,
    oneRead,
    freshness,
    landingBonus,
    total,
  };
}

// Gate: exactly one line, 1-240 characters, not only white space, and no
// leading or trailing whitespace. Mirrors the house gate, so a line the
// scorer picks can never fail it.
function passesGate(text: string): boolean {
  const len = [...text].length;
  return (
    len >= 1 &&
    len <= MAX_CHARS &&
    !text.includes("\n") &&
    !text.includes("\r") &&
    text.trim() === text &&
    text.trim().length > 0
  );
}

function main(): void {
  const scored = CANDIDATES.map(score).filter((s) => passesGate(s.text));
  if (scored.length === 0) {
    throw new Error("no candidate passes the gate");
  }

  // Highest total wins; ties break toward the shorter line, then the
  // earliest candidate, so the pick is fully deterministic.
  scored.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    const lenDiff = [...a.text].length - [...b.text].length;
    if (lenDiff !== 0) return lenDiff;
    return CANDIDATES.findIndex((c) => c.text === a.text) -
      CANDIDATES.findIndex((c) => c.text === b.text);
  });
  const winner = scored[0];

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });

  // Write the line with no trailing newline: the file is exactly the line.
  writeFileSync(outPath, winner.text, "utf8");

  // Read it back and verify the bytes match what we chose, and that the
  // file still passes the gate exactly as the house will check it.
  const back = readFileSync(outPath, "utf8");
  if (back !== winner.text) {
    throw new Error(
      "verification failed: entry.txt does not match the chosen line",
    );
  }
  if (!passesGate(back)) {
    throw new Error("verification failed: entry.txt fails the gate");
  }

  // Print the full ranking so the choice is auditable, then the winner.
  console.log("ranking (total desc):");
  for (const s of scored) {
    console.log(
      `  ${s.total.toFixed(3)}  pride=${s.earnedPride.toFixed(2)} ` +
        `scene=${s.concreteScene.toFixed(2)} inside=${s.earnedInside.toFixed(2)} ` +
        `read=${s.oneRead.toFixed(2)} fresh=${s.freshness.toFixed(2)} ` +
        `bonus=${s.landingBonus.toFixed(2)}  (${[...s.text].length} chars) ${s.text}`,
    );
  }
  console.log(`winner (${[...winner.text].length} chars): ${winner.text}`);
  console.log(
    `scores: pride=${winner.earnedPride.toFixed(2)} scene=${winner.concreteScene.toFixed(2)} ` +
      `inside=${winner.earnedInside.toFixed(2)} read=${winner.oneRead.toFixed(2)} ` +
      `fresh=${winner.freshness.toFixed(2)} bonus=${winner.landingBonus.toFixed(2)} ` +
      `total=${winner.total.toFixed(3)}`,
  );
  console.log(`wrote ${outPath}`);
}

main();
