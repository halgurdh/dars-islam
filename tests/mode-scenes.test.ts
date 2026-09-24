/**
 * Mode → scene registration check, across every game.
 *
 * Each mode-menu tab starts a shared gameplay scene by key ('Quiz',
 * 'Flashcard', 'Match', 'Sequence'). If a game's main.ts never registers
 * that scene, tapping the tab silently does nothing — typecheck can't catch
 * it, and it shipped that way once for 14 games' Review tab. This scans each
 * game's menu scenes for the mode builders it uses and asserts the matching
 * scene class is passed to bootQuizGame in its main.ts.
 *
 * Runs in plain Node via tsx — static source scan, no Phaser.
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const GAMES_DIR = fileURLToPath(new URL('../games', import.meta.url));

// Builder/call pattern in a menu scene → scene class main.ts must register.
const REQUIRES: [RegExp, string][] = [
  [/\b(quizMode|trueFalseMode|fillBlankMode|listenIdentifyMode|listenMode|trueFalseQuizMode|timedQuizMode|practiceQuizMode)\(/, 'QuizScene'],
  [/\b(reviewMode|flashcardMode)\(/, 'FlashcardScene'],
  [/\bmatchMode\(|scene\.start\('Match'/, 'MatchScene'],
  [/\bsequenceMode\(/, 'SequenceScene'],
];

let checks = 0, fails = 0;
for (const game of readdirSync(GAMES_DIR)) {
  const scenesDir = join(GAMES_DIR, game, 'src', 'scenes');
  const mainPath = join(GAMES_DIR, game, 'src', 'main.ts');
  if (!existsSync(scenesDir) || !existsSync(mainPath)) continue;
  const scenes = readdirSync(scenesDir).map((f) => readFileSync(join(scenesDir, f), 'utf8')).join('\n');
  const main = readFileSync(mainPath, 'utf8');
  for (const [pattern, sceneClass] of REQUIRES) {
    if (!pattern.test(scenes)) continue;
    checks++;
    if (!new RegExp(`new ${sceneClass}\\(`).test(main)) {
      fails++;
      console.log(`  ✗ FAIL: ${game} uses a mode needing ${sceneClass}, but main.ts doesn't register it`);
    }
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Mode scenes: ${checks} checks, ${fails} failures`);
console.log(fails === 0 ? 'ALL MODE-SCENE CHECKS PASSED ✓' : `${fails} MODE-SCENE CHECK(S) FAILED ✗`);
console.log('='.repeat(50));
process.exit(fails === 0 ? 0 : 1);
