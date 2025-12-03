/**
 * Community feature types
 * All data is stored locally (no backend yet)
 */

export type CommunityUser = {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  // Mock stats
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
  // For display
  user?: CommunityUser;
};

export type CommunityPost = {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  patternName?: string;
  caption: string;
  images: string[]; // Photo URIs from project
  likes: string[]; // Array of user IDs who liked
  bookmarks: string[]; // Array of user IDs who bookmarked
  comments: Comment[];
  createdAt: string;
  // Included data
  includeJournal: boolean;
  includeStudio: boolean;
  includePattern: boolean;
  journalEntries?: any[]; // Journal entries if included
  studioData?: any; // Studio/moodboard data if included
  // For display
  user?: CommunityUser;
  isLiked?: boolean; // Computed from likes array
  isBookmarked?: boolean; // Computed from bookmarks array
};

export type PatternStoreItem = {
  id: string;
  designer: string;
  designerId: string;
  name: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price?: number; // If free, undefined
  image: string;
  rating?: number; // 1-5
  reviewCount?: number;
  createdAt: string;
  // Pattern details
  yarnWeight?: string;
  hookSize?: string;
  category?: string;
  tags?: string[];
};

export type TesterCall = {
  id: string;
  designer: string;
  designerId: string;
  patternName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  deadline: string; // ISO date string
  requirements: string;
  reward: string;
  image: string;
  createdAt: string;
  // Application tracking
  applications: TesterApplication[];
};

export type TesterApplication = {
  id: string;
  callId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  message?: string;
};






