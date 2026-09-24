// Labels for the generic modes built by mode-menu-kit's variant builders
// (True/False, Fill-in-the-Blank, Review, Listen, Beat the Clock,
// Practice). Unlike a game's content, these are identical in every game, so
// they're translated once here instead of copied into each game's i18n.ts.
// Icons are NOT part of these labels — the mode tab adds GameMode.icon.
import { createI18n } from './i18n';
import type { LangMode } from './locale';

export interface ModeVariantStrings {
  modeTrueFalse: string;
  trueLabel: string;
  falseLabel: string;
  answerIs: (answer: string) => string;
  modeFillBlank: string;
  modeReview: string;
  reviewStart: string;
  reviewProgress: (i: number, total: number) => string;
  hear: string;
  knowIt: string;
  stillLearning: string;
  reviewSummary: (known: number, total: number) => string;
  modeListen: string;
  listenReplay: string;
  modeTimed: string;
  modePractice: string;
}

const STRINGS: Record<LangMode, ModeVariantStrings> = {
  en: {
    modeTrueFalse: 'True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    answerIs: (a) => `Answer: ${a}`,
    modeFillBlank: 'Fill in the Blank',
    modeReview: 'Review',
    reviewStart: '▶ Start',
    reviewProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Hear it',
    knowIt: '✓ I know it',
    stillLearning: '↻ Still learning',
    reviewSummary: (known, total) => `${known} / ${total} marked as known`,
    modeListen: 'Listen',
    listenReplay: '🔊 Tap to hear again',
    modeTimed: 'Beat the Clock',
    modePractice: 'Practice',
  },
  nl: {
    modeTrueFalse: 'Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    answerIs: (a) => `Antwoord: ${a}`,
    modeFillBlank: 'Vul het Woord In',
    modeReview: 'Herhalen',
    reviewStart: '▶ Start',
    reviewProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Uitspraak',
    knowIt: '✓ Ik ken dit',
    stillLearning: '↻ Nog aan het leren',
    reviewSummary: (known, total) => `${known} / ${total} als gekend gemarkeerd`,
    modeListen: 'Luisteren',
    listenReplay: '🔊 Tik om opnieuw te horen',
    modeTimed: 'Tegen de Klok',
    modePractice: 'Oefenen',
  },
  de: {
    modeTrueFalse: 'Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    answerIs: (a) => `Antwort: ${a}`,
    modeFillBlank: 'Lücke Füllen',
    modeReview: 'Wiederholen',
    reviewStart: '▶ Start',
    reviewProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Anhören',
    knowIt: '✓ Ich kenne es',
    stillLearning: '↻ Noch am Lernen',
    reviewSummary: (known, total) => `${known} / ${total} als bekannt markiert`,
    modeListen: 'Hören',
    listenReplay: '🔊 Tippen zum erneuten Hören',
    modeTimed: 'Gegen die Uhr',
    modePractice: 'Üben',
  },
  es: {
    modeTrueFalse: 'Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    answerIs: (a) => `Respuesta: ${a}`,
    modeFillBlank: 'Completa el Espacio',
    modeReview: 'Repasar',
    reviewStart: '▶ Empezar',
    reviewProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Escuchar',
    knowIt: '✓ Lo sé',
    stillLearning: '↻ Aún aprendiendo',
    reviewSummary: (known, total) => `${known} / ${total} marcadas como conocidas`,
    modeListen: 'Escuchar',
    listenReplay: '🔊 Toca para escuchar de nuevo',
    modeTimed: 'Contrarreloj',
    modePractice: 'Práctica',
  },
  fr: {
    modeTrueFalse: 'Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    answerIs: (a) => `Réponse : ${a}`,
    modeFillBlank: 'Complète le Mot',
    modeReview: 'Réviser',
    reviewStart: '▶ Commencer',
    reviewProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Écouter',
    knowIt: '✓ Je le sais',
    stillLearning: '↻ En apprentissage',
    reviewSummary: (known, total) => `${known} / ${total} marquées comme connues`,
    modeListen: 'Écouter',
    listenReplay: '🔊 Touche pour réécouter',
    modeTimed: 'Contre la Montre',
    modePractice: 'Entraînement',
  },
  ar: {
    modeTrueFalse: 'صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    answerIs: (a) => `الإجابة: ${a}`,
    modeFillBlank: 'أكمل الفراغ',
    modeReview: 'مراجعة',
    reviewStart: '▶ ابدأ',
    reviewProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 استمع',
    knowIt: '✓ أعرف هذا',
    stillLearning: '↻ ما زلت أتعلم',
    reviewSummary: (known, total) => `${known} / ${total} تم وضع علامة معروف عليها`,
    modeListen: 'استماع',
    listenReplay: '🔊 اضغط للاستماع مرة أخرى',
    modeTimed: 'سباق مع الوقت',
    modePractice: 'تدريب',
  },
};

/** Takes the calling game's own getLang (not a separate shared Locale), so
 *  these labels always follow the same language as the rest of that game. */
export function modeVariantStrings(getLang: () => LangMode): () => ModeVariantStrings {
  return createI18n(STRINGS, getLang);
}
