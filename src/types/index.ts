export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'secretary';

export type ScheduleStatus = 'pending' | 'confirmed' | 'absent' | 'vaga';

export type CertificateStatus = 'pending' | 'approved' | 'rejected';

export type SwapStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type BillingPeriod = 'monthly' | 'annual';

export interface SchoolTenant {
  id: string;
  name: string;
  code: string;
  cnpj?: string;
  city: string;
  state: string;
  logoUrl?: string;
  primaryColor?: string;
  activePlan: 'trial' | 'pro' | 'enterprise';
  trialEndsAt?: string;
}

export interface ClassSwapRequest {
  id: string;
  school_id: string;
  requester_id: string;
  requester_name: string;
  target_teacher_id: string;
  target_teacher_name: string;
  requester_schedule_id: string;
  requester_schedule_info: string;
  target_schedule_id?: string;
  target_schedule_info?: string;
  reason: string;
  status: SwapStatus;
  created_at: string;
}

export interface WhatsAppNotification {
  id: string;
  recipient_name: string;
  phone: string;
  message: string;
  type: 'substitution' | 'absence' | 'lab_approved' | 'swap_request';
  status: 'sent' | 'pending' | 'simulated';
  timestamp: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  roles?: UserRole[];
  schoolId?: string;
  schoolName?: string;
  subject?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  display_name: string | null;
  email: string;
  phone?: string;
  subject?: string | null;
  school_id?: string;
}

export interface Schedule {
  id: string;
  school_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
  class_group?: string;
  teacher_id: string | null;
  teacher_name: string;
  status: ScheduleStatus;
  created_at?: string;
}

export interface CreateScheduleDTO {
  school_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  subject: string;
  room: string;
  class_group?: string;
  teacher_id: string | null;
  teacher_name: string;
  status?: ScheduleStatus;
}

export interface LabBooking {
  id: string;
  school_id?: string;
  lab_id: string;
  teacher_id: string;
  teacher_name: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
}

export interface CreateLabBookingDTO {
  school_id?: string;
  lab_id: string;
  teacher_id: string;
  teacher_name: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface Certificate {
  id: string;
  school_id?: string;
  teacher_id: string;
  teacher_name: string;
  date: string;
  reason: string;
  image_url?: string | null;
  document_name?: string | null;
  status: CertificateStatus;
  created_at?: string;
}

export interface CreateCertificateDTO {
  school_id?: string;
  teacher_id: string;
  teacher_name: string;
  date: string;
  reason: string;
  image_url?: string | null;
  document_name?: string | null;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface ScheduleStats {
  total: number;
  confirmed: number;
  absent: number;
  pending: number;
  vaga: number;
  presenceRate: number;
  chartData: ChartDataPoint[];
}

export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  period: BillingPeriod;
  features: string[];
  popular?: boolean;
  tagline?: string;
}

export interface SupabaseCredentials {
  url: string;
  key: string;
  isConfigured: boolean;
}

