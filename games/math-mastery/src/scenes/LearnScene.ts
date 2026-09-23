import Phaser from 'phaser';
import { createButton, type QuizRunConfig } from '@shared/quiz-kit';
import { drawLineDiagram } from '@shared/line-diagram';
import { COLORS, FONT, hex } from '../theme';
import { TOPICS, type Topic } from '../topics';
import { drawTriangleDiagram } from '../triangleDiagram';
import { t } from '../i18n';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { homeSceneKey } from './TopicHomeScenes';

export class LearnScene extends Phaser.Scene {
  private topic!: Topic;
  private pageIndex = 0;

  constructor() {
    super('Learn');
  }

  init(data: { topicId: string; pageIndex?: number }): void {
    this.topic = TOPICS.find((tp) => tp.id === data.topicId) ?? TOPICS[0];
    this.pageIndex = data.pageIndex ?? 0;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    const page = this.topic.pages[this.pageIndex];
    const isLastPage = this.pageIndex === this.topic.pages.length - 1;

    // y=300 clears the ProgressBar's floating level/streak pill, the same
    // fixed-DOM-chrome margin QuizScene's HUD uses (see quiz-kit.ts).
    const headerY = 300;
    // Always a single tap straight out to the topic list, regardless of
    // which page we're on — stepping back one page at a time is a separate
    // control down by the Next button.
    const back = this.add.text(70, headerY, t().back, {
      fontFamily: FONT,
      fontSize: '21px',
      color: COLORS.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.setPadding(14, 14, 14, 14);
    back.on('pointerdown', () => this.scene.start('MenuScene'));

    this.add.text(width / 2, headerY, `${this.topic.icon} ${this.topic.title}`, {
      fontFamily: FONT,
      fontSize: '25px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    // Page dots
    const dotsY = headerY + 44;
    const dotGap = 22;
    const dotsStartX = width / 2 - ((this.topic.pages.length - 1) * dotGap) / 2;
    this.topic.pages.forEach((_, i) => {
      const dot = this.add.graphics();
      dot.fillStyle(i === this.pageIndex ? COLORS.accent : COLORS.panelLight, i === this.pageIndex ? 1 : 0.6);
      dot.fillCircle(dotsStartX + i * dotGap, dotsY, i === this.pageIndex ? 6 : 4.5);
    });

    let y = dotsY + 46;

    this.add.text(width * 0.08, y, page.heading, {
      fontFamily: FONT,
      fontSize: '22px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0, 0.5);
    y += 40;

    page.body.forEach((paragraph) => {
      this.add.text(width * 0.08, y, paragraph, {
        fontFamily: FONT,
        fontSize: '18px',
        color: COLORS.textMuted,
        wordWrap: { width: width * 0.86 },
        lineSpacing: 6,
      }).setOrigin(0, 0);
      y += 16 + Math.ceil(paragraph.length / 40) * 26;
    });

    if (page.example) {
      y += 10;
      const panelH = 100;
      const panel = this.add.graphics();
      panel.fillStyle(COLORS.panel, 1);
      panel.fillRoundedRect(width * 0.08, y, width * 0.84, panelH, 12);
      this.add.text(width * 0.12, y + panelH * 0.3, `${page.example.problem} = ${page.example.answer}`, {
        fontFamily: FONT,
        fontSize: '23px',
        fontStyle: 'bold',
        color: hex(COLORS.accentLight),
      }).setOrigin(0, 0.5);
      this.add.text(width * 0.12, y + panelH * 0.7, page.example.work.join('   →   '), {
        fontFamily: FONT,
        fontSize: '16px',
        color: COLORS.textMuted,
        wordWrap: { width: width * 0.78 },
      }).setOrigin(0, 0.5);
      y += panelH + 22;
    }

    if (page.diagram === 'lines') {
      const diagW = width * 0.7;
      const diagH = 150;
      drawLineDiagram(
        this,
        width / 2 - diagW / 2,
        y,
        diagW,
        diagH,
        page.diagramDigits ?? { da: 1, ua: 2, db: 2, ub: 3 },
        {
          lineA: COLORS.accent,
          lineB: 0x7fb3f0,
          dotHundreds: 0x4fd97a,
          dotTens: 0xe0b34f,
          dotOnes: 0x4fb3e0,
        }
      );
      if (page.diagramCaption) {
        this.add.text(width / 2, y + diagH + 14, page.diagramCaption, {
          fontFamily: FONT,
          fontSize: '15px',
          color: COLORS.textMuted,
          align: 'center',
          wordWrap: { width: width * 0.84 },
        }).setOrigin(0.5, 0);
      }
    } else if (page.diagram === 'triangle') {
      const diagW = width * 0.55;
      const diagH = 160;
      drawTriangleDiagram(
        this,
        width / 2 - diagW / 2,
        y,
        diagW,
        diagH,
        {
          edge: COLORS.accentLight,
          rightAngle: COLORS.accent,
          angleArc: 0xf0d24f,
          opposite: hex(0x4fd9a0),
          adjacent: hex(0xf0d24f),
          hypotenuse: hex(0x7fb3f0),
          angleLabel: hex(COLORS.accentLight),
        },
        FONT
      );
    }

    const navY = height * 0.93;
    const groupW = width * 0.76;
    const groupLeft = width / 2 - groupW / 2;
    const label = isLastPage ? t().practice(this.topic.totalQuestions) : t().next;

    if (this.pageIndex > 0) {
      const prevW = 84;
      const gap = 14;
      const mainW = groupW - prevW - gap;
      createButton(this, groupLeft + prevW / 2, navY, prevW, 78, t().prevPage, COLORS, FONT, () => {
        this.scene.restart({ topicId: this.topic.id, pageIndex: this.pageIndex - 1 });
      });
      createButton(this, groupLeft + prevW + gap + mainW / 2, navY, mainW, 78, label, COLORS, FONT, () => {
        if (isLastPage) this.startPractice();
        else this.scene.restart({ topicId: this.topic.id, pageIndex: this.pageIndex + 1 });
      });
    } else {
      createButton(this, width / 2, navY, groupW, 78, label, COLORS, FONT, () => {
        if (isLastPage) this.startPractice();
        else this.scene.restart({ topicId: this.topic.id, pageIndex: this.pageIndex + 1 });
      });
    }
  }

  private startPractice(): void {
    const cfg: QuizRunConfig = {
      gameId: 'math-mastery',
      totalQuestions: this.topic.totalQuestions,
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
      generateQuestion: this.topic.generateQuestion,
      menuSceneKey: homeSceneKey(this.topic),
      locale: { getLang, setLang, detectDefaultLang },
    };
    this.scene.start('Quiz', cfg);
  }
}
