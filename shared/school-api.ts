// Thin typed client for the school/class/roster RPCs — shared by the
// student and teacher dashboard pages so they don't each re-type the JSON
// shapes coming back from Supabase. Same exported names/shapes as the
// original PHP-backed version so the dashboard/teacher pages barely change.
import { getSupabase } from './supabase-client';

export interface ClassSummary {
  id: string;
  name: string;
  join_code: string;
  is_mine: boolean;
  student_count: number;
  avg_xp: number;
}

export interface SchoolSummary {
  id: string;
  name: string;
  invite_code: string;
  my_role: 'owner' | 'teacher';
  classes: ClassSummary[];
}

export interface RankedStudent {
  display_name: string;
  xp: number;
  class_name?: string;
}

export interface SchoolDashboard {
  school: { id: string; name: string; invite_code: string };
  classes: { id: string; name: string; student_count: number; avg_xp: number }[];
  top_students: RankedStudent[];
  bottom_students: RankedStudent[];
}

export interface ClassRosterStudent {
  student_id: string;
  display_name: string;
  xp: number;
  level: number;
  daily_streak: number;
  badge_count: number;
  joined_at: string;
  game_round_counts: Record<string, number>;
  last_played_date: string | null;
  teacher_note: string | null;
  attendance_pct: number | null;
}

export interface ClassRoster {
  class: { id: string; name: string; join_code: string; is_mine: boolean };
  students: ClassRosterStudent[];
  avg_xp: number;
  top_students: ClassRosterStudent[];
  bottom_students: ClassRosterStudent[];
}

export interface ClassAssignment { game_id: string; due_date: string | null; }

export interface ClassAnnouncement { id: string; class_id: string; teacher_id: string; message: string; created_at: string; }

export interface SchoolProfile { id: string; name: string; invite_code: string; org_type: 'school' | 'mosque' | 'homeschool' | 'other'; welcome_message: string | null; }

export interface MyClassStanding {
  in_class: boolean;
  class_name?: string;
  school_name?: string;
  rank?: number;
  class_size?: number;
  avg_xp?: number;
  my_xp?: number;
  org_type?: 'school' | 'mosque' | 'homeschool' | 'other';
  welcome_message?: string | null;
}

interface ListSchoolsRow {
  school_id: string;
  school_name: string;
  invite_code: string;
  my_role: 'owner' | 'teacher';
  class_id: string | null;
  class_name: string | null;
  join_code: string | null;
  is_mine: boolean | null;
  student_count: number;
  avg_xp: number;
}

export const SchoolApi = {
  async myClass(): Promise<MyClassStanding> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('my_class_standing');
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.in_class) return { in_class: false };
    return {
      in_class: true,
      class_name: row.class_name,
      school_name: row.school_name,
      rank: row.rank,
      class_size: row.class_size,
      avg_xp: row.avg_xp,
      my_xp: row.my_xp,
      org_type: row.org_type,
      welcome_message: row.welcome_message,
    };
  },

  async listSchools(): Promise<{ schools: SchoolSummary[] }> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('list_schools');
    if (error) throw error;

    const bySchool = new Map<string, SchoolSummary>();
    for (const row of (data ?? []) as ListSchoolsRow[]) {
      let school = bySchool.get(row.school_id);
      if (!school) {
        school = {
          id: row.school_id,
          name: row.school_name,
          invite_code: row.invite_code,
          my_role: row.my_role,
          classes: [],
        };
        bySchool.set(row.school_id, school);
      }
      if (row.class_id) {
        school.classes.push({
          id: row.class_id,
          name: row.class_name!,
          join_code: row.join_code!,
          is_mine: !!row.is_mine,
          student_count: Number(row.student_count),
          avg_xp: Math.round(Number(row.avg_xp)),
        });
      }
    }
    return { schools: [...bySchool.values()] };
  },

  async createSchool(name: string): Promise<{ id: string; name: string; invite_code: string }> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('create_school', { p_name: name });
    if (error) throw error;
    return { id: data.id, name: data.name, invite_code: data.invite_code };
  },

  async joinSchool(inviteCode: string): Promise<{ id: string; name: string }> {
    const supabase = getSupabase();
    try {
      await supabase.rpc('record_code_attempt', { p_rpc_name: 'join_school' });
    } catch {
      // best-effort; a failure here shouldn't block the join attempt itself
    }
    const { data, error } = await supabase.rpc('join_school', { p_invite_code: inviteCode });
    if (error) throw error;
    return { id: data.id, name: data.name };
  },

  async schoolDashboard(schoolId: string): Promise<SchoolDashboard> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('school_dashboard', { p_school_id: schoolId });
    if (error) throw error;
    return data as SchoolDashboard;
  },

  async createClass(schoolId: string, name: string): Promise<{ id: string; school_id: string; name: string; join_code: string }> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('create_class', { p_school_id: schoolId, p_name: name });
    if (error) throw error;
    return { id: data.id, school_id: data.school_id, name: data.name, join_code: data.join_code };
  },

  async classRoster(classId: string): Promise<ClassRoster> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('class_roster', { p_class_id: classId });
    if (error) throw error;
    const roster = data as { class: ClassRoster['class']; students: ClassRosterStudent[]; avg_xp: number };
    const sorted = roster.students;
    return {
      class: roster.class,
      students: sorted,
      avg_xp: Math.round(roster.avg_xp),
      top_students: sorted.slice(0, 5),
      bottom_students: sorted.length > 5 ? sorted.slice(-5) : [],
    };
  },

  /** Student sign-up: anonymous auth + join_class RPC, in one step. See
   *  `sync.joinClassAsStudent` — this just forwards to it so callers don't
   *  need to import `sync` directly for this one flow. */
  async joinClass(joinCode: string, displayName: string): Promise<{ class_name: string; school_name: string; family_code: string }> {
    const { sync } = await import('./sync');
    return sync.joinClassAsStudent(joinCode, displayName);
  },

  async listAssignedGames(classId: string): Promise<ClassAssignment[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('list_class_assignments', { p_class_id: classId });
    if (error) throw error;
    return (data ?? []) as ClassAssignment[];
  },

  async assignGame(classId: string, gameId: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.rpc('assign_game', { p_class_id: classId, p_game_id: gameId });
    if (error) throw error;
  },

  async setAssignmentDueDate(classId: string, gameId: string, dueDate: string | null): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('class_assignments')
      .update({ due_date: dueDate }).eq('class_id', classId).eq('game_id', gameId);
    if (error) throw error;
  },

  /** Teacher-only remark on a student, never surfaced to the student/parent. */
  async setTeacherNote(studentId: string, note: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('students')
      .update({ teacher_note: note.slice(0, 500) }).eq('user_id', studentId);
    if (error) throw error;
  },

  async listAnnouncements(classId: string): Promise<ClassAnnouncement[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('class_announcements')
      .select('*').eq('class_id', classId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ClassAnnouncement[];
  },

  async postAnnouncement(classId: string, message: string): Promise<void> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');
    const { error } = await supabase.from('class_announcements')
      .insert({ class_id: classId, teacher_id: user.id, message: message.trim().slice(0, 500) });
    if (error) throw error;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('class_announcements').delete().eq('id', id);
    if (error) throw error;
  },

  /** Upserts present=true for `presentStudentIds` and false for the rest of the class's roster on that date. */
  async markAttendance(classId: string, sessionDate: string, presentStudentIds: string[]): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.rpc('mark_attendance', {
      p_class_id: classId, p_session_date: sessionDate, p_present_user_ids: presentStudentIds,
    });
    if (error) throw error;
  },

  async classAttendance(classId: string, sessionDate: string): Promise<Record<string, boolean>> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('class_attendance')
      .select('student_id, present').eq('class_id', classId).eq('session_date', sessionDate);
    if (error) throw error;
    const byStudent: Record<string, boolean> = {};
    for (const row of (data ?? []) as { student_id: string; present: boolean }[]) byStudent[row.student_id] = row.present;
    return byStudent;
  },

  async getSchoolProfile(schoolId: string): Promise<SchoolProfile> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('schools')
      .select('id, name, invite_code, org_type, welcome_message').eq('id', schoolId).single();
    if (error) throw error;
    return data as SchoolProfile;
  },

  async updateSchoolProfile(schoolId: string, orgType: SchoolProfile['org_type'], welcomeMessage: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('schools')
      .update({ org_type: orgType, welcome_message: welcomeMessage.trim().slice(0, 300) || null }).eq('id', schoolId);
    if (error) throw error;
  },
};
