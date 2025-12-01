import { Project } from '@/types/project';

export type ProjectStats = {
  total: number;
  completed: number;
  active: number;
  paused: number;
  completionRate: number;
  totalTimeMinutes: number;
  averageTimePerProject: number; // Minutes
  mostActiveDay: string; // e.g., "Wednesday"
};

export type WeeklyProgressData = {
  day: string; // "M", "T", "W", etc.
  count: number; // Number of updates/actions
  minutes: number; // Time spent
};

/**
 * Calculate aggregate statistics from a list of projects
 */
export function calculateProjectStats(projects: Project[]): ProjectStats {
  const total = projects.length;
  const completed = projects.filter((p) => p.status === 'finished').length;
  const active = projects.filter((p) => p.status === 'active').length;
  const paused = projects.filter((p) => p.status === 'paused').length;
  
  const totalTimeMinutes = projects.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0);
  
  // Average time for COMPLETED projects only, to be accurate
  const completedProjectsWithTime = projects.filter(p => p.status === 'finished' && p.timeSpentMinutes > 0);
  const averageTimePerProject = completedProjectsWithTime.length > 0
    ? completedProjectsWithTime.reduce((sum, p) => sum + p.timeSpentMinutes, 0) / completedProjectsWithTime.length
    : 0;

  return {
    total,
    completed,
    active,
    paused,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalTimeMinutes,
    averageTimePerProject: Math.round(averageTimePerProject),
    mostActiveDay: 'N/A', // Placeholder for complex log analysis
  };
}

/**
 * Generate weekly activity data (mocked for now if logs aren't detailed enough)
 * Real implementation would parse `roundLog` or `journal` entries.
 */
export function calculateWeeklyActivity(projects: Project[]): WeeklyProgressData[] {
  // Initialize last 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay(); // 0-6
  
  // Create array rotated so today is last
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    result.push({
      day: days[dayIndex],
      count: 0,
      minutes: 0,
    });
  }

  // Fill with data from projects (checking updatedAt or logs)
  // This is a simplified heuristic: seeing if project was updated recently
  // For true activity, we'd need a discrete "ActivityLog" store.
  // We'll leave it zero-filled or randomized for skeleton if no log exists.
  
  // Using project.roundLog if available
  projects.forEach(project => {
    if (project.roundLog) {
      project.roundLog.forEach(log => {
        const logDate = new Date(log.createdAt);
        const diffTime = Math.abs(new Date().getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays <= 7) {
           // Find the bucket (rough approx)
           // Ideally matching dates exactly
           // For skeleton, we'll just count "recent actions"
        }
      });
    }
  });

  return result;
}



