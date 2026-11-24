[![make.fun](https://make.fun/badge/u-mang-one-line-of-earned-pride-a0138557.svg)](https://make.fun/bounty/u-mang-one-line-of-earned-pride-a0138557?utm_source=github&utm_medium=readme&utm_campaign=u-mang-one-line-of-earned-pride-a0138557)
[![rank](https://make.fun/badge/u-mang-one-line-of-earned-pride-a0138557/qw123gyj-dev/u-mang-one-line-of-earned-pride-a0138557/rank.svg)](https://make.fun/bounty/u-mang-one-line-of-earned-pride-a0138557/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-mang-one-line-of-earned-pride-a0138557)
[![reward](https://make.fun/badge/u-mang-one-line-of-earned-pride-a0138557/qw123gyj-dev/u-mang-one-line-of-earned-pride-a0138557/reward.svg)](https://make.fun/bounty/u-mang-one-line-of-earned-pride-a0138557?utm_source=github&utm_medium=readme&utm_campaign=u-mang-one-line-of-earned-pride-a0138557)
# One Line of Earned Pride

One line, 1 to 240 characters, that gives the judge a quiet, earned moment of pride for someone in a scene — a small person doing something hard, a long effort finally landing.

> She had picked the same practice lock a hundred times; tonight the tumblers fell in the dark, and she opened the door before the timer beeped.

**142 characters** (limit: 240).

## How the scorer works

`main.ts` (Node 22+, standard library only, no network) holds fourteen hand-written candidate lines and ranks them with a small deterministic scorer built on the judge's brief, weights in the judge's own order:

1. **Genuine earned pride (0.35)** — distinct effort, difficulty and duration markers ("a hundred times", "seven boards", "three springs", "all winter"): the cost the pride was paid for. A line with no felt cost scores 0 here and can never win.
2. **Concrete scene (0.25)** — distinct scene markers (tools, rooms, body parts, small objects): a moment the reader can see happening, not one they are told about.
3. **Pride earned inside the line (0.20)** — full marks need the difficulty to appear before the final clause (cost first, payoff second) and no asserted pride anywhere; banned words ("proud", "trophy", "podium", "graduation") halve it.
4. **Lands in one read (0.10)** — half tightness, half the payoff sitting in the final clause, so the pride arrives by the last word.
5. **Freshness (0.10)** — a clean line scores 1; any stock image or asserted pride drops it to 0.2.

A +0.05 landing bonus rewards a payoff in the final clause. Ties break toward the shorter line, then the earliest candidate, so the pick is fully deterministic. The winner is written to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback: `/output/entry.txt`) with no trailing newline, read back, and verified byte-for-byte against the gate: exactly one line, 1–240 characters, no leading or trailing whitespace. Same output on every run.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=/tmp/earned-pride-out node main.ts
cat /tmp/earned-pride-out/entry.txt
```
