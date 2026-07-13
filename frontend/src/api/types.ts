export type Role = 'Admin' | 'SchoolAdmin' | 'Teacher' | 'Student' | 'Guest';

export type ResourceType =
  | 'LessonPlan'
  | 'Worksheet'
  | 'Quiz'
  | 'Assessment'
  | 'Presentation'
  | 'ReadingMaterial'
  | 'Homework'
  | 'Activity'
  | 'Image'
  | 'Video'
  | 'PDF'
  | 'WordDocument';

export type ResourceStatus = 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Archived';

export type Visibility = 'Public' | 'SchoolOnly' | 'Private';

export const RESOURCE_TYPES: ResourceType[] = [
  'LessonPlan',
  'Worksheet',
  'Quiz',
  'Assessment',
  'Presentation',
  'ReadingMaterial',
  'Homework',
  'Activity',
  'Image',
  'Video',
  'PDF',
  'WordDocument',
];

export const VISIBILITIES: Visibility[] = ['Public', 'SchoolOnly', 'Private'];

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface User extends AuthUser {
  avatar?: string | null;
  status: string;
  schoolId?: string | null;
  lastLogin?: string | null;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  logo?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  status: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Grade {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface ResourceFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  resourceType: ResourceType;
  visibility: Visibility;
  status: ResourceStatus;
  downloads: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  subjectId?: string | null;
  gradeId?: string | null;
  categoryId?: string | null;
  schoolId?: string | null;
  uploadedBy: string;
  subject?: Subject | null;
  grade?: Grade | null;
  category?: Category | null;
  file?: ResourceFile | null;
  uploader?: { id: string; firstName: string; lastName: string };
  tags?: Tag[];
}

export interface SearchResult {
  data: Resource[];
  total: number;
  skip: number;
  take: number;
  pages: number;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityId?: string | null;
  entityType?: string | null;
  details?: string | null;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface AuditLogResult {
  data: AuditLog[];
  total: number;
  skip: number;
  take: number;
}

export interface SystemOverview {
  totalSchools: number;
  totalUsers: number;
  totalResources: number;
  totalDownloads: number;
  totalViews: number;
}

export interface SchoolStatistics {
  resourceCount: number;
  totalDownloads: number;
  totalViews: number;
  activeTeachers: number;
  recentUploads: Resource[];
}
