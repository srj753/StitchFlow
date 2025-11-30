import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Project, ProjectInput, ProjectCounter, JournalEntry } from '@/types/project';
import { ProjectYarn } from '@/types/yarn';
import { resolveStateStorage } from '@/lib/storage';

type ProjectsState = {
  projects: Project[];
  activeProjectId?: string;
  
  // Project CRUD
  addProject: (input: ProjectInput) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  
  // Legacy counters (kept for backwards compat)
  incrementRound: (id: string, delta?: number) => void;
  incrementHeight: (id: string, delta?: number) => void;
  
  // New counter system
  addCounter: (projectId: string, counter: Omit<ProjectCounter, 'id' | 'projectId' | 'lastUpdated'>) => void;
  updateCounter: (projectId: string, counterId: string, value: number) => void;
  updateCounterLabel: (projectId: string, counterId: string, label: string) => void;
  deleteCounter: (projectId: string, counterId: string) => void;
  
  // Notes & snippets
  updateNotes: (id: string, notes: string) => void;
  updateProgressNotes: (id: string, notes: string) => void;
  updatePatternSnippet: (id: string, snippet: string) => void;
  
  // Sections (legacy pattern tracking)
  addSection: (projectId: string, input: { name: string; targetRows?: number }) => void;
  incrementSectionRows: (projectId: string, sectionId: string, delta?: number) => void;
  
  // Journal/Timeline
  addJournalEntry: (projectId: string, entry: Omit<JournalEntry, 'id' | 'projectId' | 'createdAt'>) => void;
  deleteJournalEntry: (projectId: string, entryId: string) => void;
  
  // Photos
  addPhoto: (projectId: string, photoUri: string) => void;
  deletePhoto: (projectId: string, photoUri: string) => void;
  
  // Yarn linkage
  linkYarn: (
    projectId: string,
    payload: { yarnId: string; skeins: number; metersUsed?: number },
  ) => void;
  updateLinkedYarn: (
    projectId: string,
    linkId: string,
    data: Partial<Omit<ProjectYarn, 'id' | 'projectId'>>,
  ) => void;
  unlinkYarn: (projectId: string, linkId: string) => void;
};

const generateId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const now = () => new Date().toISOString();

const normalizePatternSource = (
  source?: Project['patternSourceType'] | 'custom',
): Project['patternSourceType'] => {
  if (source === 'custom') return 'my-pattern';
  return source ?? 'external';
};

const createProject = (input: ProjectInput): Project => {
  const timestamp = now();

  // Create default counters
  const defaultCounters: ProjectCounter[] = [
    {
      id: generateId('counter'),
      projectId: '', // Will be set after project creation
      type: 'row',
      label: 'Rows',
      currentValue: 0,
      targetValue: input.totalRoundsEstimate,
      lastUpdated: timestamp,
    },
    {
      id: generateId('counter'),
      projectId: '',
      type: 'stitch',
      label: 'Stitches',
      currentValue: 0,
      lastUpdated: timestamp,
    },
  ];

  const project: Project = {
    id: generateId('project'),
    name: input.name.trim(),
    patternName: input.patternName?.trim(),
    patternSourceType: normalizePatternSource(input.patternSourceType),
    yarnWeight: input.yarnWeight?.trim(),
    hookSizeMm: input.hookSizeMm,
    targetHeightInches: input.targetHeightInches,
    totalRoundsEstimate: input.totalRoundsEstimate,
    
    // Legacy counters
    currentRound: 0,
    currentHeightInches: 0,
    
    // New counter system
    counters: defaultCounters.map(c => ({ ...c, projectId: generateId('project') })),
    
    notes: input.notes?.trim(),
    progressNotes: input.progressNotes ?? '',
    patternSnippet: input.patternSnippet?.trim(),
    status: input.status ?? 'active',
    sections: [],
    roundLog: [],
    
    // New features
    journal: [],
    photos: [],
    thumbnail: input.thumbnail,
    timeSpentMinutes: input.timeSpentMinutes ?? 0,
    yarnIds: input.yarnIds ?? [],
    linkedYarns: input.linkedYarns ?? [],
    
    createdAt: timestamp,
    updatedAt: timestamp,
    lastOpenedAt: timestamp,
    sourceUrl: input.sourceUrl?.trim(),
    colorPalette: input.colorPalette,
    
    // Gauge
    gaugeSwatchRows: input.gaugeSwatchRows,
    gaugeSwatchStitches: input.gaugeSwatchStitches,
    gaugeSwatchInches: input.gaugeSwatchInches,
  };

  // Fix counter projectIds
  project.counters = project.counters.map(c => ({ ...c, projectId: project.id }));

  return project;
};

const storageResolver = () => resolveStateStorage();

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: undefined,
      addProject: (input) => {
        const project = createProject(input);
        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: project.id,
        }));
        return project;
      },
      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  ...data,
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      updateProjectStatus: (id, status) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== id) return project;
            
            const updated = {
              ...project,
              status,
              updatedAt: now(),
            };
            
            // Auto-add journal entry when finished
            if (status === 'finished' && project.status !== 'finished') {
              updated.journal = [
                ...project.journal,
                {
                  id: generateId('journal'),
                  projectId: id,
                  type: 'finished',
                  text: `Finished on ${new Date().toLocaleDateString()}`,
                  createdAt: now(),
                },
              ];
            }
            
            return updated;
          }),
        }));
      },
      setActiveProject: (id) => {
        const projectExists = get().projects.some((project) => project.id === id);
        if (!projectExists) return;

        set((state) => ({
          activeProjectId: id,
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  lastOpenedAt: now(),
                }
              : project,
          ),
        }));
      },
      incrementRound: (id, delta = 1) => {
        if (delta === 0) return;

        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== id) return project;

            const nextRound = Math.max(0, project.currentRound + delta);
            return {
              ...project,
              currentRound: nextRound,
              updatedAt: now(),
              roundLog: [
                {
                  id: generateId('log'),
                  projectId: project.id,
                  roundNumber: nextRound,
                  delta,
                  createdAt: now(),
                },
                ...project.roundLog,
              ],
            };
          }),
        }));
      },
      incrementHeight: (id, delta = 0.25) => {
        if (delta === 0) return;

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  currentHeightInches: Math.max(0, Number(project.currentHeightInches) + delta),
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      updateNotes: (id, notes) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  notes,
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      updateProgressNotes: (id, notes) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  progressNotes: notes,
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      updatePatternSnippet: (id, snippet) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  patternSnippet: snippet,
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      addSection: (projectId, input) => {
        const section = {
          id: generateId('section'),
          name: input.name.trim(),
          targetRows: input.targetRows,
          completedRows: 0,
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  sections: [...project.sections, section],
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      incrementSectionRows: (projectId, sectionId, delta = 1) => {
        if (delta === 0) return;

        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project;

            return {
              ...project,
              sections: project.sections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      completedRows: Math.max(0, (section.completedRows ?? 0) + delta),
                    }
                  : section,
              ),
              updatedAt: now(),
            };
          }),
        }));
      },
      
      // New counter system
      addCounter: (projectId, counterInput) => {
        const counter: ProjectCounter = {
          id: generateId('counter'),
          projectId,
          type: counterInput.type,
          label: counterInput.label,
          currentValue: counterInput.currentValue,
          targetValue: counterInput.targetValue,
          lastUpdated: now(),
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  counters: [...project.counters, counter],
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      
      updateCounter: (projectId, counterId, value) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  counters: project.counters.map((counter) =>
                    counter.id === counterId
                      ? {
                          ...counter,
                          currentValue: Math.max(0, value),
                          lastUpdated: now(),
                        }
                      : counter,
                  ),
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      
      updateCounterLabel: (projectId, counterId, label) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  counters: project.counters.map((counter) =>
                    counter.id === counterId
                      ? {
                          ...counter,
                          label: label.trim(),
                          lastUpdated: now(),
                        }
                      : counter,
                  ),
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      deleteCounter: (projectId, counterId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  counters: project.counters.filter((c) => c.id !== counterId),
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          activeProjectId: state.activeProjectId === id ? undefined : state.activeProjectId,
        }));
      },
      
      // Journal/Timeline
      addJournalEntry: (projectId, entryInput) => {
        const entry: JournalEntry = {
          id: generateId('journal'),
          projectId,
          type: entryInput.type,
          title: entryInput.title,
          text: entryInput.text,
          photoUri: entryInput.photoUri,
          metadata: entryInput.metadata,
          createdAt: now(),
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  journal: [entry, ...project.journal],
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      
      deleteJournalEntry: (projectId, entryId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  journal: project.journal.filter((e) => e.id !== entryId),
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      
      // Photos
      addPhoto: (projectId, photoUri) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  photos: [photoUri, ...project.photos],
                  // Auto-set thumbnail if none exists
                  thumbnail: project.thumbnail || photoUri,
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      
      deletePhoto: (projectId, photoUri) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            const newPhotos = project.photos.filter((uri) => uri !== photoUri);
            return project.id === projectId
              ? {
                  ...project,
                  photos: newPhotos,
                  // Update thumbnail if we deleted the current thumbnail
                  thumbnail: project.thumbnail === photoUri ? (newPhotos[0] || undefined) : project.thumbnail,
                  updatedAt: now(),
                }
              : project;
          }),
        }));
      },
      
      // Yarn linkage
      linkYarn: (projectId, payload) => {
        const newLink: ProjectYarn = {
          id: generateId('pyarn'),
          projectId,
          yarnId: payload.yarnId,
          skeinsUsed: Math.max(0, payload.skeins),
          metersUsed: payload.metersUsed,
          addedAt: now(),
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  linkedYarns: [...project.linkedYarns, newLink],
                  yarnIds: Array.from(new Set([...project.yarnIds, payload.yarnId])),
                  updatedAt: now(),
                }
              : project,
          ),
        }));
      },
      
      updateLinkedYarn: (projectId, linkId, data) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project;
            const updatedLinks = project.linkedYarns.map((link) =>
              link.id === linkId
                ? {
                    ...link,
                    ...data,
                  }
                : link,
            );
            return {
              ...project,
              linkedYarns: updatedLinks,
              yarnIds: Array.from(new Set(updatedLinks.map((link) => link.yarnId))),
              updatedAt: now(),
            };
          }),
        }));
      },
      
      unlinkYarn: (projectId, linkId) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project;
            const remainingLinks = project.linkedYarns.filter((link) => link.id !== linkId);
            return {
              ...project,
              linkedYarns: remainingLinks,
              yarnIds: Array.from(new Set(remainingLinks.map((link) => link.yarnId))),
              updatedAt: now(),
            };
          }),
        }));
      },
    }),
    {
      name: 'knotiq-projects',
      storage: createJSONStorage(storageResolver),
      version: 6, // Increment version for migration
      migrate: (persistedState: unknown, version) => {
        const state = persistedState as any;
        if (!state) {
          return {
            projects: [],
            activeProjectId: undefined,
          };
        }

        let migratedProjects = state.projects || [];

        // Migrate from version < 2
        if (version < 2) {
          migratedProjects = migratedProjects.map((project: any) => ({
            ...project,
            status: project.status ?? 'active',
            sections: project.sections ?? [],
            roundLog: project.roundLog ?? [],
            colorPalette: project.colorPalette ?? [],
            patternSourceType: normalizePatternSource(project.patternSourceType),
          }));
        }

        // Migrate from version < 3 (add new fields)
        if (version < 3) {
          migratedProjects = migratedProjects.map((project: any) => {
            const timestamp = now();
            
            // Create default counters if not present
            const defaultCounters: ProjectCounter[] = project.counters || [
              {
                id: generateId('counter'),
                projectId: project.id,
                type: 'row',
                label: 'Rows',
                currentValue: project.currentRound || 0,
                targetValue: project.totalRoundsEstimate,
                lastUpdated: timestamp,
              },
              {
                id: generateId('counter'),
                projectId: project.id,
                type: 'stitch',
                label: 'Stitches',
                currentValue: 0,
                lastUpdated: timestamp,
              },
            ];
            
            return {
              ...project,
              patternSourceType: normalizePatternSource(project.patternSourceType),
              counters: defaultCounters,
              journal: project.journal || [],
              photos: project.photos || [],
              yarnIds: project.yarnIds || [],
              linkedYarns: project.linkedYarns || [],
              gaugeSwatchRows: project.gaugeSwatchRows,
              gaugeSwatchStitches: project.gaugeSwatchStitches,
              gaugeSwatchInches: project.gaugeSwatchInches,
            };
          });
        }
        
        // Migrate from version < 4 (ensure linked yarn data)
        if (version < 4) {
          migratedProjects = migratedProjects.map((project: any) => {
            const timestamp = now();
            const existingLinks: ProjectYarn[] =
              project.linkedYarns ||
              (Array.isArray(project.yarnIds)
                ? project.yarnIds.map((yarnId: string) => ({
                    id: generateId('pyarn'),
                    projectId: project.id,
                    yarnId,
                    skeinsUsed: 0,
                    addedAt: timestamp,
                  }))
                : []);
            
            return {
              ...project,
              linkedYarns: existingLinks,
              yarnIds: project.yarnIds || Array.from(new Set(existingLinks.map((link) => link.yarnId))),
            };
          });
        }
        
        if (version < 5) {
          migratedProjects = migratedProjects.map((project: any) => ({
            ...project,
            progressNotes: project.progressNotes || '',
          }));
        }

        // Migrate to v6: Add thumbnail and timeSpentMinutes
        if (version < 6) {
          migratedProjects = migratedProjects.map((project: any) => ({
            ...project,
            thumbnail: project.photos && project.photos.length > 0 ? project.photos[0] : undefined,
            timeSpentMinutes: 0,
          }));
        }

        return {
          ...state,
          projects: migratedProjects,
        };
      },
    },
  ),
);
