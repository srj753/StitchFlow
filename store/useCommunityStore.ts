import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { resolveStateStorage } from '@/lib/storage';
import {
  Comment,
  CommunityPost,
  CommunityUser,
  PatternStoreItem,
  TesterApplication,
  TesterCall,
} from '@/types/community';

type CommunityState = {
  // Users (mock data for now)
  users: CommunityUser[];
  currentUserId: string; // Mock current user ID
  
  // Posts
  posts: CommunityPost[];
  addPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'bookmarks' | 'comments'>) => CommunityPost;
  deletePost: (postId: string) => void;
  
  // Likes
  likePost: (postId: string, userId: string) => void;
  unlikePost: (postId: string, userId: string) => void;
  
  // Bookmarks
  bookmarkPost: (postId: string, userId: string) => void;
  unbookmarkPost: (postId: string, userId: string) => void;
  getBookmarkedPosts: (userId: string) => CommunityPost[];
  
  // Comments
  addComment: (postId: string, userId: string, text: string) => Comment;
  deleteComment: (postId: string, commentId: string) => void;
  
  // Pattern Store
  patternStoreItems: PatternStoreItem[];
  addPatternStoreItem: (item: Omit<PatternStoreItem, 'id' | 'createdAt'>) => PatternStoreItem;
  
  // Tester Calls
  testerCalls: TesterCall[];
  addTesterCall: (call: Omit<TesterCall, 'id' | 'createdAt' | 'applications'>) => TesterCall;
  applyToTesterCall: (callId: string, userId: string, message?: string) => TesterApplication;
  getTesterApplications: (userId: string) => TesterApplication[];
};

// Mock current user
const MOCK_CURRENT_USER_ID = 'current-user-1';

// Generate mock users
function generateMockUsers(): CommunityUser[] {
  return [
    {
      id: MOCK_CURRENT_USER_ID,
      username: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=You',
      bio: 'Crochet enthusiast',
      createdAt: new Date().toISOString(),
      followersCount: 42,
      followingCount: 18,
      postsCount: 0,
    },
    {
      id: 'user-2',
      username: 'AliceCrafts',
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Alice',
      bio: 'Pattern designer & maker',
      createdAt: new Date().toISOString(),
      followersCount: 1240,
      followingCount: 320,
      postsCount: 45,
    },
    {
      id: 'user-3',
      username: 'YarnMaster99',
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=YarnMaster',
      bio: 'Amigurumi specialist',
      createdAt: new Date().toISOString(),
      followersCount: 890,
      followingCount: 156,
      postsCount: 32,
    },
    {
      id: 'user-4',
      username: 'StitchWitch',
      avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=StitchWitch',
      bio: 'Garment maker',
      createdAt: new Date().toISOString(),
      followersCount: 2100,
      followingCount: 450,
      postsCount: 78,
    },
  ];
}

// Generate mock pattern store items
function generateMockPatternStoreItems(): PatternStoreItem[] {
  return [
    {
      id: 'pattern-1',
      designer: 'CrochetDesigns Co.',
      designerId: 'user-2',
      name: 'Cozy Winter Cardigan',
      description: 'A warm and stylish cardigan perfect for winter',
      difficulty: 'Intermediate',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1619250907298-76e018cb932e?q=80&w=600&auto=format&fit=crop',
      rating: 4.5,
      reviewCount: 23,
      createdAt: new Date().toISOString(),
      yarnWeight: 'Worsted',
      hookSize: '5.5mm',
      category: 'Garments',
      tags: ['cardigan', 'winter', 'intermediate'],
    },
    {
      id: 'pattern-2',
      designer: 'YarnCraft Studio',
      designerId: 'user-3',
      name: 'Amigurumi Bunny Collection',
      description: 'Three adorable bunny patterns in different sizes',
      difficulty: 'Beginner',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=600&auto=format&fit=crop',
      rating: 4.8,
      reviewCount: 67,
      createdAt: new Date().toISOString(),
      yarnWeight: 'DK',
      hookSize: '3.5mm',
      category: 'Amigurumi',
      tags: ['bunny', 'amigurumi', 'beginner'],
    },
    {
      id: 'pattern-3',
      designer: 'StitchMaster',
      designerId: 'user-4',
      name: 'Lace Shawl Pattern',
      description: 'Elegant lace shawl with intricate details',
      difficulty: 'Advanced',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1584662889139-55364fb59d84?q=80&w=600&auto=format&fit=crop',
      rating: 4.9,
      reviewCount: 12,
      createdAt: new Date().toISOString(),
      yarnWeight: 'Fingering',
      hookSize: '3mm',
      category: 'Accessories',
      tags: ['shawl', 'lace', 'advanced'],
    },
  ];
}

// Generate mock tester calls
function generateMockTesterCalls(): TesterCall[] {
  return [
    {
      id: 'tester-1',
      designer: 'CrochetDesigns Co.',
      designerId: 'user-2',
      patternName: 'Cozy Winter Cardigan',
      difficulty: 'Intermediate',
      deadline: '2024-02-15',
      requirements: 'Must complete within 2 weeks, provide feedback',
      reward: 'Free pattern + early access',
      image: 'https://images.unsplash.com/photo-1619250907298-76e018cb932e?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      applications: [],
    },
    {
      id: 'tester-2',
      designer: 'YarnCraft Studio',
      designerId: 'user-3',
      patternName: 'Amigurumi Bunny Collection',
      difficulty: 'Beginner',
      deadline: '2024-02-20',
      requirements: 'Test all 3 sizes, document issues',
      reward: 'Pattern bundle + credit',
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      applications: [],
    },
    {
      id: 'tester-3',
      designer: 'StitchMaster',
      designerId: 'user-4',
      patternName: 'Lace Shawl Pattern',
      difficulty: 'Advanced',
      deadline: '2024-02-28',
      requirements: 'Test with different yarn weights',
      reward: 'Premium pattern access',
      image: 'https://images.unsplash.com/photo-1584662889139-55364fb59d84?q=80&w=600&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      applications: [],
    },
  ];
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      users: generateMockUsers(),
      currentUserId: MOCK_CURRENT_USER_ID,
      
      posts: [],
      patternStoreItems: generateMockPatternStoreItems(),
      testerCalls: generateMockTesterCalls(),
      
      addPost: (postData) => {
        const newPost: CommunityPost = {
          ...postData,
          id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          likes: [],
          bookmarks: [],
          comments: [],
        };
        
        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
        
        // Update user's post count
        set((state) => ({
          users: state.users.map((u) =>
            u.id === postData.userId
              ? { ...u, postsCount: (u.postsCount || 0) + 1 }
              : u
          ),
        }));
        
        return newPost;
      },
      
      deletePost: (postId) => {
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== postId),
        }));
      },
      
      likePost: (postId, userId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId && !post.likes.includes(userId)
              ? { ...post, likes: [...post.likes, userId] }
              : post
          ),
        }));
      },
      
      unlikePost: (postId, userId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, likes: post.likes.filter((id) => id !== userId) }
              : post
          ),
        }));
      },
      
      bookmarkPost: (postId, userId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId && !post.bookmarks.includes(userId)
              ? { ...post, bookmarks: [...post.bookmarks, userId] }
              : post
          ),
        }));
      },
      
      unbookmarkPost: (postId, userId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, bookmarks: post.bookmarks.filter((id) => id !== userId) }
              : post
          ),
        }));
      },
      
      getBookmarkedPosts: (userId) => {
        return get().posts.filter((post) => post.bookmarks.includes(userId));
      },
      
      addComment: (postId, userId, text) => {
        const newComment: Comment = {
          id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          postId,
          userId,
          text,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          ),
        }));
        
        return newComment;
      },
      
      deleteComment: (postId, commentId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, comments: post.comments.filter((c) => c.id !== commentId) }
              : post
          ),
        }));
      },
      
      addPatternStoreItem: (itemData) => {
        const newItem: PatternStoreItem = {
          ...itemData,
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          patternStoreItems: [...state.patternStoreItems, newItem],
        }));
        
        return newItem;
      },
      
      addTesterCall: (callData) => {
        const newCall: TesterCall = {
          ...callData,
          id: `tester-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          applications: [],
        };
        
        set((state) => ({
          testerCalls: [...state.testerCalls, newCall],
        }));
        
        return newCall;
      },
      
      applyToTesterCall: (callId, userId, message) => {
        const newApplication: TesterApplication = {
          id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          callId,
          userId,
          status: 'pending',
          appliedAt: new Date().toISOString(),
          message,
        };
        
        set((state) => ({
          testerCalls: state.testerCalls.map((call) =>
            call.id === callId
              ? { ...call, applications: [...call.applications, newApplication] }
              : call
          ),
        }));
        
        return newApplication;
      },
      
      getTesterApplications: (userId) => {
        const calls = get().testerCalls;
        const applications: TesterApplication[] = [];
        
        calls.forEach((call) => {
          call.applications
            .filter((app) => app.userId === userId)
            .forEach((app) => applications.push(app));
        });
        
        return applications;
      },
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => resolveStateStorage()),
    }
  )
);







