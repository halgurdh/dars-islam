// Thin typed client for the school/class/roster endpoints — shared by the
// student and teacher dashboard pages so they don't each re-type the JSON
// shapes coming back from api/school/* and api/class/*.
import { api } from './api';

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
  level: number;
  class_name?: string;
}

export interface SchoolDashboard {
  school: { id: string; name: string; invite_code: string };
  classes: { id: string; name: string; student_count: number; avg_xp: number }[];
  top_students: RankedStudent[];
  bottom_students: RankedStudent[];
}

export interface ClassRosterStudent {
  display_name: string;
  xp: number;
  level: number;
  daily_streak: number;
  badge_count: number;
  joined_at: string;
}

export interface ClassRoster {
  class: { id: string; name: string; join_code: string; is_mine: boolean };
  students: ClassRosterStudent[];
  avg_xp: number;
  top_students: ClassRosterStudent[];
  bottom_students: ClassRosterStudent[];
}

export interface MyClassStanding {
  in_class: boolean;
  class_name?: string;
  school_name?: string;
  rank?: number;
  class_size?: number;
  avg_xp?: number;
  my_xp?: number;
}

export const SchoolApi = {
  myClass: () => api.get<MyClassStanding>('/class/mine.php'),

  listSchools: () => api.get<{ schools: SchoolSummary[] }>('/school/list.php'),
  createSchool: (name: string) => api.post<{ id: string; name: string; invite_code: string }>('/school/create.php', { name }),
  joinSchool: (invite_code: string) => api.post<{ id: string; name: string }>('/school/join.php', { invite_code }),
  schoolDashboard: (schoolId: string) => api.get<SchoolDashboard>(`/school/dashboard.php?school_id=${encodeURIComponent(schoolId)}`),

  createClass: (schoolId: string, name: string) =>
    api.post<{ id: string; school_id: string; name: string; join_code: string }>('/class/create.php', { school_id: schoolId, name }),
  classRoster: (classId: string) => api.get<ClassRoster>(`/class/roster.php?class_id=${encodeURIComponent(classId)}`),

  joinClass: (joinCode: string, displayName: string) =>
    api.post<{ session_token: string; class_name: string; school_name: string }>('/auth/join-class.php', {
      join_code: joinCode,
      display_name: displayName,
    }),
};
