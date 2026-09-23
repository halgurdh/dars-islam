// Thin client for the content_reports table — lets any visitor (signed in
// or not) flag a game's content or a teacher's announcement as inappropriate
// or factually wrong. Insert-only: reviewed by the site owner directly in
// the Supabase table editor, same as class_announcements has no in-app
// moderation path today.
import { getSupabase } from './supabase-client';

export type ReportTargetType = 'announcement' | 'game';

export async function reportContent(targetType: ReportTargetType, targetId: string, reason: string): Promise<void> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  const { error } = await supabase.from('content_reports').insert({
    reporter_id: session?.user.id ?? null,
    target_type: targetType,
    target_id: targetId,
    reason,
  });
  if (error) throw error;
}

/** Best-effort game slug from the current page's URL, e.g. `/dars-islam/games/asma-match/` -> `asma-match`. */
export function currentGameSlug(): string {
  const match = window.location.pathname.match(/\/games\/([^/]+)\/?/);
  if (match) return match[1];
  return window.location.pathname.replace(/\/+$/, '').length <= 1 ? 'wrapper' : 'unknown';
}
