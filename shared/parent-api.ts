// Thin typed client for the parent-role RPCs/tables — mirrors the shape of
// shared/school-api.ts so the parent dashboard follows the same pattern as
// the teacher/student ones.
import { getSupabase } from './supabase-client';

export interface ChildSummary {
  student_id: string;
  display_name: string | null;
  xp: number;
  level: number;
  daily_streak: number;
  best_daily_streak: number;
  badges: string[];
  class_id: string;
  class_name: string;
  school_name: string;
  game_round_counts: Record<string, number>;
  last_played_date: string | null;
  attendance_pct: number | null;
}

export interface ParentalControls {
  student_id: string;
  daily_time_limit_minutes: number | null;
  blocked_game_ids: string[];
}

export const ParentApi = {
  async linkChild(familyCode: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.rpc('link_parent', { p_family_code: familyCode });
    if (error) throw error;
  },

  async myChildren(): Promise<ChildSummary[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('my_children');
    if (error) throw error;
    return (data ?? []) as ChildSummary[];
  },

  async getControls(studentId: string): Promise<ParentalControls> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('parental_controls')
      .select('student_id, daily_time_limit_minutes, blocked_game_ids')
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    return data ?? { student_id: studentId, daily_time_limit_minutes: null, blocked_game_ids: [] };
  },

  async setControls(studentId: string, controls: { daily_time_limit_minutes: number | null; blocked_game_ids: string[] }): Promise<void> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('parental_controls').upsert({
      student_id: studentId,
      daily_time_limit_minutes: controls.daily_time_limit_minutes,
      blocked_game_ids: controls.blocked_game_ids,
      updated_by: user?.id ?? null,
    });
    if (error) throw error;
  },
};
