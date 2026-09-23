import { getLang } from './systems/Locale';

export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Term ↔ definition, with a "layer" rank from the internet's physical
// hardware up to online human behavior — so Layer Sort tests a real mental
// model of how the internet is built, not an alphabetical sort.
export interface TechTerm {
  id: number;
  termEn: string; termNl: string; termDe: string; termEs: string; termFr: string; termAr: string;
  meaningEn: string; meaningNl: string; meaningDe: string; meaningEs: string; meaningFr: string; meaningAr: string;
  layer: number;
}

export const TERMS: TechTerm[] = [
  { id: 1, termEn: 'Wi-Fi', termNl: 'Wifi', termDe: 'WLAN', termEs: 'Wifi', termFr: 'Wifi', termAr: 'واي فاي',
    meaningEn: 'Wireless internet connection', meaningNl: 'Draadloze internetverbinding', meaningDe: 'Drahtlose Internetverbindung', meaningEs: 'Conexión inalámbrica a internet', meaningFr: 'Connexion internet sans fil', meaningAr: 'اتصال إنترنت لاسلكي', layer: 1 },
  { id: 2, termEn: 'Router', termNl: 'Router', termDe: 'Router', termEs: 'Router', termFr: 'Routeur', termAr: 'راوتر',
    meaningEn: 'Connects devices to the internet', meaningNl: 'Verbindt apparaten met internet', meaningDe: 'Verbindet Geräte mit dem Internet', meaningEs: 'Conecta dispositivos a internet', meaningFr: 'Connecte les appareils à internet', meaningAr: 'يربط الأجهزة بالإنترنت', layer: 2 },
  { id: 3, termEn: 'Firewall', termNl: 'Firewall', termDe: 'Firewall', termEs: 'Cortafuegos', termFr: 'Pare-feu', termAr: 'جدار حماية',
    meaningEn: 'Blocks unwanted access', meaningNl: 'Blokkeert ongewenste toegang', meaningDe: 'Blockiert unerwünschten Zugriff', meaningEs: 'Bloquea el acceso no deseado', meaningFr: 'Bloque les accès indésirables', meaningAr: 'يمنع الوصول غير المرغوب فيه', layer: 3 },
  { id: 4, termEn: 'Browser', termNl: 'Browser', termDe: 'Browser', termEs: 'Navegador', termFr: 'Navigateur', termAr: 'متصفح',
    meaningEn: 'Used to view websites', meaningNl: 'Gebruikt om websites te bekijken', meaningDe: 'Wird verwendet, um Websites anzuzeigen', meaningEs: 'Se usa para ver sitios web', meaningFr: 'Utilisé pour voir des sites web', meaningAr: 'يُستخدم لعرض المواقع الإلكترونية', layer: 4 },
  { id: 5, termEn: 'URL', termNl: 'URL', termDe: 'URL', termEs: 'URL', termFr: 'URL', termAr: 'عنوان URL',
    meaningEn: "A website's address", meaningNl: 'Het adres van een website', meaningDe: 'Die Adresse einer Website', meaningEs: 'La dirección de un sitio web', meaningFr: "L'adresse d'un site web", meaningAr: 'عنوان موقع إلكتروني', layer: 5 },
  { id: 6, termEn: 'Download', termNl: 'Downloaden', termDe: 'Herunterladen', termEs: 'Descargar', termFr: 'Télécharger', termAr: 'تنزيل',
    meaningEn: 'Save a file from the internet', meaningNl: 'Een bestand van internet opslaan', meaningDe: 'Eine Datei aus dem Internet speichern', meaningEs: 'Guardar un archivo de internet', meaningFr: 'Enregistrer un fichier depuis internet', meaningAr: 'حفظ ملف من الإنترنت', layer: 6 },
  { id: 7, termEn: 'Cloud', termNl: 'Cloud', termDe: 'Cloud', termEs: 'Nube', termFr: 'Cloud', termAr: 'التخزين السحابي',
    meaningEn: 'Online storage', meaningNl: 'Online opslag', meaningDe: 'Online-Speicher', meaningEs: 'Almacenamiento en línea', meaningFr: 'Stockage en ligne', meaningAr: 'تخزين عبر الإنترنت', layer: 7 },
  { id: 8, termEn: 'Password', termNl: 'Wachtwoord', termDe: 'Passwort', termEs: 'Contraseña', termFr: 'Mot de passe', termAr: 'كلمة المرور',
    meaningEn: 'A secret code to protect an account', meaningNl: 'Een geheime code om een account te beschermen', meaningDe: 'Ein geheimer Code zum Schutz eines Kontos', meaningEs: 'Un código secreto para proteger una cuenta', meaningFr: 'Un code secret pour protéger un compte', meaningAr: 'رمز سري لحماية حساب', layer: 8 },
  { id: 9, termEn: 'Virus', termNl: 'Virus', termDe: 'Virus', termEs: 'Virus', termFr: 'Virus', termAr: 'فيروس',
    meaningEn: 'Harmful software', meaningNl: 'Schadelijke software', meaningDe: 'Schädliche Software', meaningEs: 'Software dañino', meaningFr: 'Logiciel malveillant', meaningAr: 'برنامج ضار', layer: 9 },
  { id: 10, termEn: 'Cyberbullying', termNl: 'Cyberpesten', termDe: 'Cybermobbing', termEs: 'Ciberacoso', termFr: 'Cyberharcèlement', termAr: 'التنمر الإلكتروني',
    meaningEn: 'Being mean to others online', meaningNl: 'Gemeen zijn tegen anderen online', meaningDe: 'Online gemein zu anderen sein', meaningEs: 'Ser cruel con otros en línea', meaningFr: 'Être méchant envers les autres en ligne', meaningAr: 'التصرف بقسوة تجاه الآخرين عبر الإنترنت', layer: 10 },
];

export function termFor(item: TechTerm): string {
  switch (getLang()) {
    case 'nl': return item.termNl;
    case 'de': return item.termDe;
    case 'es': return item.termEs;
    case 'fr': return item.termFr;
    case 'ar': return item.termAr;
    default: return item.termEn;
  }
}

export function meaningFor(item: TechTerm): string {
  switch (getLang()) {
    case 'nl': return item.meaningNl;
    case 'de': return item.meaningDe;
    case 'es': return item.meaningEs;
    case 'fr': return item.meaningFr;
    case 'ar': return item.meaningAr;
    default: return item.meaningEn;
  }
}
