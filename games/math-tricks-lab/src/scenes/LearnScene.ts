import Phaser from 'phaser';
import { createButton, type QuizRunConfig } from '@shared/quiz-kit';
import { COLORS, FONT, hex } from '../theme';
import { TRICKS, type Trick } from '../tricks';
import { drawLineDiagram } from '@shared/line-diagram';
import { t } from '../i18n';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { homeSceneKey } from './TrickHomeScenes';

export class LearnScene extends Phaser.Scene {
  private trick!: Trick;

  constructor() {
    super('Learn');
  }

  init(data: { trickId: string }): void {
    this.trick = TRICKS.find((tr) => tr.id === data.trickId) ?? TRICKS[0];
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    // y=300 clears the ProgressBar's floating level/streak pill, the same
    // fixed-DOM-chrome margin QuizScene's HUD uses (see quiz-kit.ts).
    const headerY = 300;
    const back = this.add.text(70, headerY, t().back, {
      fontFamily: FONT,
      fontSize: '21px',
      color: COLORS.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.setPadding(14, 14, 14, 14);
    back.on('pointerdown', () => this.scene.start('MenuScene'));

    this.add.text(width / 2, headerY, `${this.trick.icon} ${this.trick.title()}`, {
      fontFamily: FONT,
      fontSize: '26px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    let y = headerY + 68;

    this.add.text(width * 0.08, y, t().howItWorks, {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0, 0.5);
    y += height * 0.035;

    this.trick.steps().forEach((step) => {
      this.add.text(width * 0.1, y, `• ${step}`, {
        fontFamily: FONT,
        fontSize: '18px',
        color: COLORS.textMuted,
        wordWrap: { width: width * 0.84 },
      }).setOrigin(0, 0);
      y += 22 + Math.ceil(step.length / 38) * 19;
    });

    y += height * 0.015;
    this.add.text(width * 0.08, y, t().example, {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0, 0.5);
    y += height * 0.035;

    const panelH = height * 0.14;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 1);
    panel.fillRoundedRect(width * 0.08, y, width * 0.84, panelH, 12);
    this.add.text(width * 0.12, y + panelH * 0.28, `${this.trick.example.problem} = ${this.trick.example.answer}`, {
      fontFamily: FONT,
      fontSize: '24px',
      fontStyle: 'bold',
      color: hex(COLORS.accentLight),
    }).setOrigin(0, 0.5);
    this.add.text(width * 0.12, y + panelH * 0.68, this.trick.example.work().join('   →   '), {
      fontFamily: FONT,
      fontSize: '17px',
      color: COLORS.textMuted,
      wordWrap: { width: width * 0.78 },
    }).setOrigin(0, 0.5);
    y += panelH + height * 0.025;

    if (this.trick.hasDiagram) {
      const diagW = width * 0.78;
      const diagH = height * 0.13;
      drawLineDiagram(
        this,
        width / 2 - diagW / 2,
        y,
        diagW,
        diagH,
        { da: 1, ua: 2, db: 3, ub: 2 },
        {
          lineA: COLORS.accent,
          lineB: 0x7fb3f0, // distinct hue from accent, purely visual
          dotHundreds: 0x4fd97a,
          dotTens: 0xe0b34f,
          dotOnes: 0x4fb3e0,
        }
      );
      y += diagH + height * 0.025;
    }

    createButton(this, width / 2, height * 0.91, width * 0.76, 80, t().practice(this.trick.totalQuestions), COLORS, FONT, () => {
      this.startPractice();
    });
  }

  private startPractice(): void {
    const cfg: QuizRunConfig = {
      gameId: 'math-tricks-lab',
      totalQuestions: this.trick.totalQuestions,
      theme: COLORS,
      fontFamily: FONT,
      strings: () => ({
        round: t().round,
        score: t().score,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().roundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      generateQuestion: () => this.trick.generateQuestion(),
      menuSceneKey: homeSceneKey(this.trick),
      locale: { getLang, setLang, detectDefaultLang },
    };
    this.scene.start('Quiz', cfg);
  }
}
