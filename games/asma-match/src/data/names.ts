import { getLang } from '../systems/Locale';

export interface AsmaName {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
  meaningDe: string;
  meaningEs: string;
  meaningFr: string;
}

// The 99 Names of Allah (Asma-ul-Husna), in the traditional order.
// Meanings are given as short, widely-accepted one-line translations.
export const ASMA_UL_HUSNA: AsmaName[] = [
  { id: 1, arabic: 'الرَّحْمَن', transliteration: 'Ar-Rahman', meaningEn: 'The Most Compassionate', meaningNl: 'De Meest Barmhartige', meaningDe: 'Der Allbarmherzige', meaningEs: 'El Compasivo', meaningFr: 'Le Tout Compatissant' },
  { id: 2, arabic: 'الرَّحِيم', transliteration: 'Ar-Rahim', meaningEn: 'The Most Merciful', meaningNl: 'De Meest Genadevolle', meaningDe: 'Der Barmherzige', meaningEs: 'El Misericordioso', meaningFr: 'Le Très Miséricordieux' },
  { id: 3, arabic: 'الْمَلِك', transliteration: 'Al-Malik', meaningEn: 'The King', meaningNl: 'De Koning', meaningDe: 'Der König', meaningEs: 'El Rey', meaningFr: 'Le Roi' },
  { id: 4, arabic: 'الْقُدُّوس', transliteration: 'Al-Quddus', meaningEn: 'The Most Holy', meaningNl: 'De Meest Heilige', meaningDe: 'Der Allheilige', meaningEs: 'El Santísimo', meaningFr: 'Le Très Saint' },
  { id: 5, arabic: 'السَّلَام', transliteration: 'As-Salam', meaningEn: 'The Source of Peace', meaningNl: 'De Bron van Vrede', meaningDe: 'Die Quelle des Friedens', meaningEs: 'La Fuente de la Paz', meaningFr: 'La Source de la Paix' },
  { id: 6, arabic: 'الْمُؤْمِن', transliteration: 'Al-Mu’min', meaningEn: 'The Granter of Security', meaningNl: 'De Schenker van Veiligheid', meaningDe: 'Der Gewährer von Sicherheit', meaningEs: 'El Dador de Seguridad', meaningFr: 'Le Dispensateur de Sécurité' },
  { id: 7, arabic: 'الْمُهَيْمِن', transliteration: 'Al-Muhaymin', meaningEn: 'The Guardian', meaningNl: 'De Bewaker', meaningDe: 'Der Beschützer', meaningEs: 'El Protector', meaningFr: 'Le Gardien' },
  { id: 8, arabic: 'الْعَزِيز', transliteration: 'Al-Aziz', meaningEn: 'The Almighty', meaningNl: 'De Almachtige', meaningDe: 'Der Allmächtige', meaningEs: 'El Todopoderoso', meaningFr: 'Le Tout-Puissant' },
  { id: 9, arabic: 'الْجَبَّار', transliteration: 'Al-Jabbar', meaningEn: 'The Compeller', meaningNl: 'De Onweerstaanbare', meaningDe: 'Der Bezwinger', meaningEs: 'El Compelente', meaningFr: 'Le Contraignant' },
  { id: 10, arabic: 'الْمُتَكَبِّر', transliteration: 'Al-Mutakabbir', meaningEn: 'The Supreme', meaningNl: 'De Allerhoogste', meaningDe: 'Der Erhabene', meaningEs: 'El Supremo', meaningFr: 'Le Suprême' },
  { id: 11, arabic: 'الْخَالِق', transliteration: 'Al-Khaliq', meaningEn: 'The Creator', meaningNl: 'De Schepper', meaningDe: 'Der Schöpfer', meaningEs: 'El Creador', meaningFr: 'Le Créateur' },
  { id: 12, arabic: 'الْبَارِئ', transliteration: 'Al-Bari’', meaningEn: 'The Maker', meaningNl: 'De Ontwerper', meaningDe: 'Der Erschaffer', meaningEs: 'El Hacedor', meaningFr: 'Le Faiseur' },
  { id: 13, arabic: 'الْمُصَوِّر', transliteration: 'Al-Musawwir', meaningEn: 'The Fashioner', meaningNl: 'De Vormgever', meaningDe: 'Der Gestalter', meaningEs: 'El Formador', meaningFr: 'Le Formateur' },
  { id: 14, arabic: 'الْغَفَّار', transliteration: 'Al-Ghaffar', meaningEn: 'The Ever-Forgiving', meaningNl: 'De Steeds Vergevende', meaningDe: 'Der Immerverzeihende', meaningEs: 'El Perdonador Constante', meaningFr: 'Le Toujours-Pardonneur' },
  { id: 15, arabic: 'الْقَهَّار', transliteration: 'Al-Qahhar', meaningEn: 'The Subduer', meaningNl: 'De Overweldiger', meaningDe: 'Der Bezwingende', meaningEs: 'El Dominador', meaningFr: 'Le Dominateur' },
  { id: 16, arabic: 'الْوَهَّاب', transliteration: 'Al-Wahhab', meaningEn: 'The Bestower', meaningNl: 'De Gulle Gever', meaningDe: 'Der Freigebige Schenker', meaningEs: 'El Dadivoso', meaningFr: 'Le Donateur Généreux' },
  { id: 17, arabic: 'الرَّزَّاق', transliteration: 'Ar-Razzaq', meaningEn: 'The Provider', meaningNl: 'De Voorziener', meaningDe: 'Der Versorger', meaningEs: 'El Proveedor', meaningFr: 'Le Pourvoyeur' },
  { id: 18, arabic: 'الْفَتَّاح', transliteration: 'Al-Fattah', meaningEn: 'The Opener', meaningNl: 'De Opener', meaningDe: 'Der Eröffner', meaningEs: 'El Abridor', meaningFr: "L'Ouvreur" },
  { id: 19, arabic: 'الْعَلِيم', transliteration: 'Al-’Alim', meaningEn: 'The All-Knowing', meaningNl: 'De Alwetende', meaningDe: 'Der Allwissende', meaningEs: 'El Omnisciente', meaningFr: "L'Omniscient" },
  { id: 20, arabic: 'الْقَابِض', transliteration: 'Al-Qabid', meaningEn: 'The Withholder', meaningNl: 'De Beperker', meaningDe: 'Der Beschränker', meaningEs: 'El Restrictor', meaningFr: 'Le Restreignant' },
  { id: 21, arabic: 'الْبَاسِط', transliteration: 'Al-Basit', meaningEn: 'The Extender', meaningNl: 'De Verruimer', meaningDe: 'Der Erweiterer', meaningEs: 'El Expansor', meaningFr: "L'Extenseur" },
  { id: 22, arabic: 'الْخَافِض', transliteration: 'Al-Khafid', meaningEn: 'The Abaser', meaningNl: 'De Vernederaar', meaningDe: 'Der Erniedriger', meaningEs: 'El Humillador', meaningFr: "L'Abaisseur" },
  { id: 23, arabic: 'الرَّافِع', transliteration: 'Ar-Rafi’', meaningEn: 'The Exalter', meaningNl: 'De Verheffer', meaningDe: 'Der Erhöher', meaningEs: 'El Exaltador', meaningFr: "L'Élévateur" },
  { id: 24, arabic: 'الْمُعِزّ', transliteration: 'Al-Mu’izz', meaningEn: 'The Honorer', meaningNl: 'De Eregever', meaningDe: 'Der Ehrgeber', meaningEs: 'El Honrador', meaningFr: 'Celui qui Honore' },
  { id: 25, arabic: 'الْمُذِلّ', transliteration: 'Al-Mudhill', meaningEn: 'The Dishonorer', meaningNl: 'De Onteerder', meaningDe: 'Der Entehrende', meaningEs: 'El Deshonrador', meaningFr: 'Celui qui Déshonore' },
  { id: 26, arabic: 'السَّمِيع', transliteration: 'As-Sami’', meaningEn: 'The All-Hearing', meaningNl: 'De Alhorende', meaningDe: 'Der Allhörende', meaningEs: 'El que Todo lo Oye', meaningFr: "L'Audient" },
  { id: 27, arabic: 'الْبَصِير', transliteration: 'Al-Basir', meaningEn: 'The All-Seeing', meaningNl: 'De Alziende', meaningDe: 'Der Allsehende', meaningEs: 'El que Todo lo Ve', meaningFr: 'Le Clairvoyant' },
  { id: 28, arabic: 'الْحَكَم', transliteration: 'Al-Hakam', meaningEn: 'The Judge', meaningNl: 'De Rechter', meaningDe: 'Der Richter', meaningEs: 'El Juez', meaningFr: "L'Arbitre" },
  { id: 29, arabic: 'الْعَدْل', transliteration: 'Al-’Adl', meaningEn: 'The Utterly Just', meaningNl: 'De Rechtvaardige', meaningDe: 'Der vollkommen Gerechte', meaningEs: 'El Absolutamente Justo', meaningFr: 'Le Parfaitement Juste' },
  { id: 30, arabic: 'اللَّطِيف', transliteration: 'Al-Latif', meaningEn: 'The Gentle', meaningNl: 'De Zachtaardige', meaningDe: 'Der Sanftmütige', meaningEs: 'El Sutil y Bondadoso', meaningFr: 'Le Subtil' },
  { id: 31, arabic: 'الْخَبِير', transliteration: 'Al-Khabir', meaningEn: 'The All-Aware', meaningNl: 'De Welingelichte', meaningDe: 'Der Allkundige', meaningEs: 'El que Todo lo Sabe', meaningFr: 'Le Bien-Informé' },
  { id: 32, arabic: 'الْحَلِيم', transliteration: 'Al-Halim', meaningEn: 'The Forbearing', meaningNl: 'De Verdraagzame', meaningDe: 'Der Nachsichtige', meaningEs: 'El Indulgente', meaningFr: 'Le Longanime' },
  { id: 33, arabic: 'الْعَظِيم', transliteration: 'Al-’Azim', meaningEn: 'The Magnificent', meaningNl: 'De Grootse', meaningDe: 'Der Großartige', meaningEs: 'El Magnífico', meaningFr: 'Le Magnifique' },
  { id: 34, arabic: 'الْغَفُور', transliteration: 'Al-Ghafur', meaningEn: 'The Great Forgiver', meaningNl: 'De Grote Vergever', meaningDe: 'Der Große Vergeber', meaningEs: 'El Gran Perdonador', meaningFr: 'Le Grand Pardonneur' },
  { id: 35, arabic: 'الشَّكُور', transliteration: 'Ash-Shakur', meaningEn: 'The Most Appreciative', meaningNl: 'De Dankbare', meaningDe: 'Der Dankbare', meaningEs: 'El Agradecido', meaningFr: 'Le Reconnaissant' },
  { id: 36, arabic: 'الْعَلِيّ', transliteration: 'Al-’Aliyy', meaningEn: 'The Most High', meaningNl: 'De Verhevenste', meaningDe: 'Der Allerhöchste', meaningEs: 'El Altísimo', meaningFr: 'Le Très-Haut' },
  { id: 37, arabic: 'الْكَبِير', transliteration: 'Al-Kabir', meaningEn: 'The Most Great', meaningNl: 'De Grootste', meaningDe: 'Der Größte', meaningEs: 'El Más Grande', meaningFr: 'Le Très Grand' },
  { id: 38, arabic: 'الْحَفِيظ', transliteration: 'Al-Hafiz', meaningEn: 'The Preserver', meaningNl: 'De Behoeder', meaningDe: 'Der Bewahrer', meaningEs: 'El Preservador', meaningFr: 'Le Préservateur' },
  { id: 39, arabic: 'الْمُقِيت', transliteration: 'Al-Muqit', meaningEn: 'The Sustainer', meaningNl: 'De Onderhouder', meaningDe: 'Der Erhalter', meaningEs: 'El Sustentador', meaningFr: 'Le Nourricier' },
  { id: 40, arabic: 'الْحسِيب', transliteration: 'Al-Hasib', meaningEn: 'The Reckoner', meaningNl: 'De Berekenaar', meaningDe: 'Der Abrechner', meaningEs: 'El Contable', meaningFr: 'Le Comptable' },
  { id: 41, arabic: 'الْجَلِيل', transliteration: 'Al-Jalil', meaningEn: 'The Majestic', meaningNl: 'De Majestueuze', meaningDe: 'Der Majestätische', meaningEs: 'El Majestuoso', meaningFr: 'Le Majestueux' },
  { id: 42, arabic: 'الْكَرِيم', transliteration: 'Al-Karim', meaningEn: 'The Most Generous', meaningNl: 'De Vrijgevige', meaningDe: 'Der Großzügigste', meaningEs: 'El Generosísimo', meaningFr: 'Le Très Généreux' },
  { id: 43, arabic: 'الرَّقِيب', transliteration: 'Ar-Raqib', meaningEn: 'The Watchful', meaningNl: 'De Waakzame', meaningDe: 'Der Wachsame', meaningEs: 'El Vigilante', meaningFr: 'Le Vigilant' },
  { id: 44, arabic: 'الْمُجِيب', transliteration: 'Al-Mujib', meaningEn: 'The Responsive', meaningNl: 'De Verhorende', meaningDe: 'Der Erhörende', meaningEs: 'El que Responde', meaningFr: 'Celui qui Répond' },
  { id: 45, arabic: 'الْوَاسِع', transliteration: 'Al-Wasi’', meaningEn: 'The All-Encompassing', meaningNl: 'De Alomvattende', meaningDe: 'Der Allumfassende', meaningEs: 'El Omniabarcante', meaningFr: "L'Immense" },
  { id: 46, arabic: 'الْحَكِيم', transliteration: 'Al-Hakim', meaningEn: 'The All-Wise', meaningNl: 'De Alwijze', meaningDe: 'Der Allweise', meaningEs: 'El Sapientísimo', meaningFr: 'Le Sage' },
  { id: 47, arabic: 'الْوَدُود', transliteration: 'Al-Wadud', meaningEn: 'The Most Loving', meaningNl: 'De Liefdevolle', meaningDe: 'Der Liebevollste', meaningEs: 'El Amoroso', meaningFr: 'Le Très Aimant' },
  { id: 48, arabic: 'الْمَجِيد', transliteration: 'Al-Majid', meaningEn: 'The Glorious', meaningNl: 'De Roemrijke', meaningDe: 'Der Ruhmreiche', meaningEs: 'El Glorioso', meaningFr: 'Le Glorieux' },
  { id: 49, arabic: 'الْبَاعِث', transliteration: 'Al-Ba’ith', meaningEn: 'The Resurrector', meaningNl: 'De Opwekker', meaningDe: 'Der Auferwecker', meaningEs: 'El Resucitador', meaningFr: 'Le Ressuscitateur' },
  { id: 50, arabic: 'الشَّهِيد', transliteration: 'Ash-Shahid', meaningEn: 'The Witness', meaningNl: 'De Getuige', meaningDe: 'Der Zeuge', meaningEs: 'El Testigo', meaningFr: 'Le Témoin' },
  { id: 51, arabic: 'الْحَقّ', transliteration: 'Al-Haqq', meaningEn: 'The Truth', meaningNl: 'De Waarheid', meaningDe: 'Die Wahrheit', meaningEs: 'La Verdad', meaningFr: 'La Vérité' },
  { id: 52, arabic: 'الْوَكِيل', transliteration: 'Al-Wakil', meaningEn: 'The Trustee', meaningNl: 'De Voogd', meaningDe: 'Der Sachwalter', meaningEs: 'El Administrador', meaningFr: 'Le Garant' },
  { id: 53, arabic: 'الْقَوِيّ', transliteration: 'Al-Qawiyy', meaningEn: 'The All-Strong', meaningNl: 'De Sterke', meaningDe: 'Der Allstarke', meaningEs: 'El Fuerte', meaningFr: 'Le Fort' },
  { id: 54, arabic: 'الْمَتِين', transliteration: 'Al-Matin', meaningEn: 'The Firm', meaningNl: 'De Standvastige', meaningDe: 'Der Standhafte', meaningEs: 'El Firme', meaningFr: 'Le Ferme' },
  { id: 55, arabic: 'الْوَلِيّ', transliteration: 'Al-Waliyy', meaningEn: 'The Protecting Friend', meaningNl: 'De Beschermende Vriend', meaningDe: 'Der Beschützende Freund', meaningEs: 'El Amigo Protector', meaningFr: "L'Ami Protecteur" },
  { id: 56, arabic: 'الْحَمِيد', transliteration: 'Al-Hamid', meaningEn: 'The Praiseworthy', meaningNl: 'De Lofwaardige', meaningDe: 'Der Lobenswerte', meaningEs: 'El Digno de Alabanza', meaningFr: 'Le Digne de Louange' },
  { id: 57, arabic: 'الْمُحْصِي', transliteration: 'Al-Muhsi', meaningEn: 'The Accounter', meaningNl: 'De Optekenaar', meaningDe: 'Der Erfassende', meaningEs: 'El que Todo lo Cuenta', meaningFr: 'Celui qui Dénombre Tout' },
  { id: 58, arabic: 'الْمُبْدِئ', transliteration: 'Al-Mubdi’', meaningEn: 'The Originator', meaningNl: 'De Voortbrenger', meaningDe: 'Der Urheber', meaningEs: 'El Iniciador', meaningFr: "L'Initiateur" },
  { id: 59, arabic: 'الْمُعِيد', transliteration: 'Al-Mu’id', meaningEn: 'The Restorer', meaningNl: 'De Hersteller', meaningDe: 'Der Wiederherstellende', meaningEs: 'El Restaurador', meaningFr: 'Le Restaurateur' },
  { id: 60, arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi', meaningEn: 'The Giver of Life', meaningNl: 'De Levenschenker', meaningDe: 'Der Lebensspender', meaningEs: 'El Dador de Vida', meaningFr: 'Le Donneur de Vie' },
  { id: 61, arabic: 'اَلْمُمِيت', transliteration: 'Al-Mumit', meaningEn: 'The Bringer of Death', meaningNl: 'Degene Die Doet Sterven', meaningDe: 'Der Herbeiführer des Todes', meaningEs: 'El que Da la Muerte', meaningFr: 'Celui qui Donne la Mort' },
  { id: 62, arabic: 'الْحَيّ', transliteration: 'Al-Hayy', meaningEn: 'The Ever-Living', meaningNl: 'De Eeuwiglevende', meaningDe: 'Der Ewig Lebendige', meaningEs: 'El Viviente Eterno', meaningFr: 'Le Vivant Éternel' },
  { id: 63, arabic: 'الْقَيُّوم', transliteration: 'Al-Qayyum', meaningEn: 'The Self-Subsisting Sustainer', meaningNl: 'De Zelfstandige Onderhouder', meaningDe: 'Der Selbstbeständige Erhalter', meaningEs: 'El Sustentador que Subsiste por Sí Mismo', meaningFr: 'Celui qui Subsiste par Lui-même' },
  { id: 64, arabic: 'الْوَاجِد', transliteration: 'Al-Wajid', meaningEn: 'The Finder', meaningNl: 'De Vinder', meaningDe: 'Der Finder', meaningEs: 'El que Todo lo Encuentra', meaningFr: 'Celui qui Trouve' },
  { id: 65, arabic: 'الْمَاجِد', transliteration: 'Al-Majid', meaningEn: 'The Illustrious', meaningNl: 'De Verhevene', meaningDe: 'Der Glanzvolle', meaningEs: 'El Ilustre', meaningFr: "L'Illustre" },
  { id: 66, arabic: 'الْواحِد', transliteration: 'Al-Wahid', meaningEn: 'The One', meaningNl: 'De Ene', meaningDe: 'Der Eine', meaningEs: 'El Único (Uno)', meaningFr: "L'Unique (Un)" },
  { id: 67, arabic: 'اَلاَحَد', transliteration: 'Al-Ahad', meaningEn: 'The Unique', meaningNl: 'De Unieke', meaningDe: 'Der Einzigartige', meaningEs: 'El Único', meaningFr: "L'Unique" },
  { id: 68, arabic: 'الصَّمَد', transliteration: 'As-Samad', meaningEn: 'The Eternal Refuge', meaningNl: 'De Eeuwige Toevlucht', meaningDe: 'Die Ewige Zuflucht', meaningEs: 'El Refugio Eterno', meaningFr: 'Le Refuge Éternel' },
  { id: 69, arabic: 'الْقَادِر', transliteration: 'Al-Qadir', meaningEn: 'The All-Powerful', meaningNl: 'De Machtige', meaningDe: 'Der Allmächtig-Bestimmende', meaningEs: 'El Poderoso', meaningFr: 'Le Puissant' },
  { id: 70, arabic: 'الْمُقْتَدِر', transliteration: 'Al-Muqtadir', meaningEn: 'The One With Absolute Power', meaningNl: 'De Oppermachtige', meaningDe: 'Der mit Absoluter Macht', meaningEs: 'El de Poder Absoluto', meaningFr: 'Celui qui a le Pouvoir Absolu' },
  { id: 71, arabic: 'الْمُقَدِّم', transliteration: 'Al-Muqaddim', meaningEn: 'The Expediter', meaningNl: 'De Vervroeger', meaningDe: 'Der Voranbringer', meaningEs: 'El que Adelanta', meaningFr: 'Celui qui Avance' },
  { id: 72, arabic: 'الْمُؤَخِّر', transliteration: 'Al-Mu’akhkhir', meaningEn: 'The Delayer', meaningNl: 'De Vertrager', meaningDe: 'Der Verzögerer', meaningEs: 'El que Retrasa', meaningFr: 'Celui qui Retarde' },
  { id: 73, arabic: 'الأَوَّل', transliteration: 'Al-Awwal', meaningEn: 'The First', meaningNl: 'De Eerste', meaningDe: 'Der Erste', meaningEs: 'El Primero', meaningFr: 'Le Premier' },
  { id: 74, arabic: 'الآخِر', transliteration: 'Al-Akhir', meaningEn: 'The Last', meaningNl: 'De Laatste', meaningDe: 'Der Letzte', meaningEs: 'El Último', meaningFr: 'Le Dernier' },
  { id: 75, arabic: 'الظَّاهِر', transliteration: 'Az-Zahir', meaningEn: 'The Manifest', meaningNl: 'De Zichtbare', meaningDe: 'Der Offenkundige', meaningEs: 'El Manifiesto', meaningFr: "L'Apparent" },
  { id: 76, arabic: 'الْبَاطِن', transliteration: 'Al-Batin', meaningEn: 'The Hidden', meaningNl: 'De Verborgene', meaningDe: 'Der Verborgene', meaningEs: 'El Oculto', meaningFr: 'Le Caché' },
  { id: 77, arabic: 'الْوَالِي', transliteration: 'Al-Wali', meaningEn: 'The Governor', meaningNl: 'De Bestuurder', meaningDe: 'Der Verwalter', meaningEs: 'El Gobernante', meaningFr: 'Le Gouverneur' },
  { id: 78, arabic: 'الْمُتَعَالِي', transliteration: 'Al-Muta’ali', meaningEn: 'The Most Exalted', meaningNl: 'De Meest Verhevene', meaningDe: 'Der Erhabenste', meaningEs: 'El Sumamente Exaltado', meaningFr: 'Le Très Élevé' },
  { id: 79, arabic: 'الْبَرّ', transliteration: 'Al-Barr', meaningEn: 'The Source of Goodness', meaningNl: 'De Bron van het Goede', meaningDe: 'Die Quelle der Güte', meaningEs: 'La Fuente de la Bondad', meaningFr: 'La Source de la Bonté' },
  { id: 80, arabic: 'التَّوَّاب', transliteration: 'At-Tawwab', meaningEn: 'The Ever-Accepting of Repentance', meaningNl: 'De Aanvaarder van Berouw', meaningDe: 'Der Reue-Annehmende', meaningEs: 'El que Acepta el Arrepentimiento', meaningFr: 'Celui qui Accepte le Repentir' },
  { id: 81, arabic: 'الْمُنْتَقِم', transliteration: 'Al-Muntaqim', meaningEn: 'The Avenger', meaningNl: 'De Vergelder', meaningDe: 'Der Vergelter', meaningEs: 'El Vengador', meaningFr: 'Le Vengeur' },
  { id: 82, arabic: 'العَفُوّ', transliteration: 'Al-’Afuww', meaningEn: 'The Pardoner', meaningNl: 'De Kwijtschelder', meaningDe: 'Der Verzeihende', meaningEs: 'El Indultador', meaningFr: 'Celui qui Efface les Péchés' },
  { id: 83, arabic: 'الرَّؤُوف', transliteration: 'Ar-Ra’uf', meaningEn: 'The Most Kind', meaningNl: 'De Goedertierene', meaningDe: 'Der Gütigste', meaningEs: 'El Benigno', meaningFr: 'Le Très Bienveillant' },
  { id: 84, arabic: 'مَالِك الْمُلْك', transliteration: 'Malik-ul-Mulk', meaningEn: 'The Owner of All Sovereignty', meaningNl: 'De Eigenaar van Alle Heerschappij', meaningDe: 'Der Besitzer Aller Herrschaft', meaningEs: 'El Dueño de Toda Soberanía', meaningFr: 'Le Possesseur de Toute Souveraineté' },
  { id: 85, arabic: 'ذُوالْجَلاَلِ وَالإكْرَام', transliteration: 'Dhul-Jalali wal-Ikram', meaningEn: 'The Lord of Majesty and Generosity', meaningNl: 'De Heer van Majesteit en Vrijgevigheid', meaningDe: 'Der Herr der Majestät und Großzügigkeit', meaningEs: 'El Señor de la Majestad y la Generosidad', meaningFr: 'Le Seigneur de la Majesté et de la Générosité' },
  { id: 86, arabic: 'الْمُقْسِط', transliteration: 'Al-Muqsit', meaningEn: 'The Equitable', meaningNl: 'De Billijke', meaningDe: 'Der Ausgleichend-Gerechte', meaningEs: 'El Equitativo', meaningFr: "L'Équitable" },
  { id: 87, arabic: 'الْجَامِع', transliteration: 'Al-Jami’', meaningEn: 'The Gatherer', meaningNl: 'De Verzamelaar', meaningDe: 'Der Versammler', meaningEs: 'El Reunidor', meaningFr: 'Le Rassembleur' },
  { id: 88, arabic: 'الْغَنِيّ', transliteration: 'Al-Ghani', meaningEn: 'The Self-Sufficient', meaningNl: 'De Onafhankelijke', meaningDe: 'Der Unabhängige', meaningEs: 'El Autosuficiente', meaningFr: 'Le Riche par Lui-même' },
  { id: 89, arabic: 'الْمُغْنِي', transliteration: 'Al-Mughni', meaningEn: 'The Enricher', meaningNl: 'De Verrijker', meaningDe: 'Der Bereicherer', meaningEs: 'El Enriquecedor', meaningFr: 'Celui qui Enrichit' },
  { id: 90, arabic: 'اَلْمَانِعُ', transliteration: 'Al-Mani’', meaningEn: 'The Preventer of Harm', meaningNl: 'De Voorkomer van Kwaad', meaningDe: 'Der Abwender von Schaden', meaningEs: 'El que Previene el Daño', meaningFr: 'Celui qui Empêche le Mal' },
  { id: 91, arabic: 'الضَّار', transliteration: 'Ad-Darr', meaningEn: 'The One Whose Will Prevails', meaningNl: 'Degene Wiens Wil Geschiedt', meaningDe: 'Der, Dessen Wille Geschieht', meaningEs: 'Aquel Cuya Voluntad Prevalece', meaningFr: 'Celui dont la Volonté Prévaut' },
  { id: 92, arabic: 'النَّافِع', transliteration: 'An-Nafi’', meaningEn: 'The Bestower of Benefit', meaningNl: 'De Schenker van Welzijn', meaningDe: 'Der Nutzenspender', meaningEs: 'El Dador de Beneficio', meaningFr: 'Celui qui Accorde le Bienfait' },
  { id: 93, arabic: 'النُّور', transliteration: 'An-Nur', meaningEn: 'The Light', meaningNl: 'Het Licht', meaningDe: 'Das Licht', meaningEs: 'La Luz', meaningFr: 'La Lumière' },
  { id: 94, arabic: 'الْهَادِي', transliteration: 'Al-Hadi', meaningEn: 'The Guide', meaningNl: 'De Gids', meaningDe: 'Der Führer', meaningEs: 'El Guía', meaningFr: 'Le Guide' },
  { id: 95, arabic: 'الْبَدِيع', transliteration: 'Al-Badi’', meaningEn: 'The Incomparable Originator', meaningNl: 'De Weergaloze Grondlegger', meaningDe: 'Der Unvergleichliche Urheber', meaningEs: 'El Iniciador Incomparable', meaningFr: "L'Initiateur Incomparable" },
  { id: 96, arabic: 'اَلْبَاقِي', transliteration: 'Al-Baqi', meaningEn: 'The Everlasting', meaningNl: 'De Eeuwigblijvende', meaningDe: 'Der Immerwährende', meaningEs: 'El Perdurable', meaningFr: 'Le Perpétuel' },
  { id: 97, arabic: 'الْوَارِث', transliteration: 'Al-Warith', meaningEn: 'The Inheritor', meaningNl: 'De Erfgenaam', meaningDe: 'Der Erbe', meaningEs: 'El Heredero', meaningFr: "L'Héritier" },
  { id: 98, arabic: 'الرَّشِيد', transliteration: 'Ar-Rashid', meaningEn: 'The Guide to the Right Path', meaningNl: 'De Gids naar het Rechte Pad', meaningDe: 'Der Rechtleiter', meaningEs: 'El Guía al Camino Recto', meaningFr: 'Le Guide vers le Droit Chemin' },
  { id: 99, arabic: 'الصَّبُور', transliteration: 'As-Sabur', meaningEn: 'The Most Patient', meaningNl: 'De Meest Geduldige', meaningDe: 'Der Geduldigste', meaningEs: 'El Paciente', meaningFr: 'Le Très Patient' },
];

export function meaningFor(name: AsmaName): string {
  switch (getLang()) {
    case 'nl': return name.meaningNl;
    case 'de': return name.meaningDe;
    case 'es': return name.meaningEs;
    case 'fr': return name.meaningFr;
    default: return name.meaningEn;
  }
}
