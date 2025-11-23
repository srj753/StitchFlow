# Crochet App Architecture

**Last updated:** November 21, 2024

## Current Status

This document describes the current architecture of the crochet companion app and outlines the restructuring plan based on user feedback.

## 1. Current Structure Overview

### Folder Structure

```
crochet-reboot/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx        # Root tab navigator (6 tabs)
│   ├── home/index.tsx     # Dashboard/home screen
│   ├── projects/          # Project management
│   │   ├── index.tsx      # Project list
│   │   ├── create.tsx     # Create/edit project form
│   │   └── [id].tsx       # Project detail view
│   ├── patterns/index.tsx # Pattern library browser
│   ├── create-pattern/    # Pattern maker/editor
│   │   └── index.tsx
│   ├── community/index.tsx # Community (placeholder)
│   └── settings/index.tsx # App settings
├── components/            # Reusable UI components
│   ├── Card.tsx
│   ├── Screen.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectForm.tsx
│   ├── patterns/
│   │   └── PatternCard.tsx
│   └── color/
│       └── ColorPickerModal.tsx
├── store/                 # Zustand state management
│   ├── useProjectsStore.ts        # Project data & actions
│   ├── usePatternDraftStore.ts    # Pattern maker drafts
│   └── useAppearanceStore.ts      # Theme preferences
├── types/                 # TypeScript type definitions
│   ├── project.ts
│   └── pattern.ts
├── hooks/                 # Custom React hooks
│   ├── useTheme.ts
│   └── useEffectiveColorScheme.ts
├── lib/                   # Utilities & helpers
│   ├── storage.ts         # AsyncStorage (web)
│   ├── storage.native.ts  # AsyncStorage (native)
│   ├── theme.ts
│   ├── color.ts
│   └── patternDraft.ts
├── data/                  # Static/mock data
│   └── patterns/
│       └── catalog.ts
└── constants/             # App-wide constants
    └── Colors.ts
```

### Core Data Models

#### Project (types/project.ts)
```typescript
type Project = {
  id: string;
  name: string;
  patternName?: string;
  patternSourceType: 'external' | 'built-in' | 'my-pattern';
  yarnWeight?: string;
  hookSizeMm?: number;
  targetHeightInches?: number;
  totalRoundsEstimate?: number;
  currentRound: number;           // Basic counter
  currentHeightInches: number;
  notes?: string;
  patternSnippet?: string;
  status: 'active' | 'paused' | 'finished';
  sections: ProjectSection[];
  roundLog: RoundLogEntry[];      // History of counter changes
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  sourceUrl?: string;
  colorPalette?: string[];
};

type ProjectSection = {
  id: string;
  name: string;
  targetRows?: number;
  completedRows: number;
};

type RoundLogEntry = {
  id: string;
  projectId: string;
  roundNumber: number;
  delta: number;
  createdAt: string;
};
```

#### Pattern (types/pattern.ts)
```typescript
type Pattern = {
  id: string;
  name: string;
  designer: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  yarnWeight: string;
  hookSize: string;
  stitches: string[];
  moods: string[];
  tags: string[];
  palette: string[];
  referenceUrl?: string;
  snippet?: string;
  estimatedRounds?: number;
  targetHeightInches?: number;
  notes?: string;
  hero?: boolean;
  patternSourceType?: 'external' | 'built-in' | 'my-pattern';
};
```

#### PatternDraft (store/usePatternDraftStore.ts)
Used by the Pattern Maker feature for creating custom patterns.

```typescript
type PatternDraft = {
  title: string;
  description: string;
  difficulty: PatternDifficulty;
  yarnWeight: string;
  hookSize: string;
  gauge: string;
  tags: string[];
  notes: string;
  palette: string[];
  sections: PatternSectionDraft[];
  updatedAt: string;
};
```

### State Management

**Zustand** stores with AsyncStorage persistence:

1. **useProjectsStore**
   - Projects array
   - Active project ID
   - Actions: addProject, updateProject, incrementRound, incrementHeight, etc.
   - Persisted to `knotiq-projects`

2. **usePatternDraftStore**
   - Single draft object (auto-saves)
   - Actions: setMeta, addSection, addRow, updateRow, etc.
   - Persisted to `knotiq-pattern-draft`

3. **useAppearanceStore**
   - Theme mode (system/light/dark)
   - Persisted to `knotiq-appearance`

### Navigation (Expo Router)

**Current tab structure:**
- Home (dashboard)
- Projects (list + detail)
- Patterns (library browser)
- Create (pattern maker)
- Community (placeholder)
- Settings

**Stack navigation:**
- `/projects/[id]` - Project detail
- `/projects/create` - Create/edit project (accepts `patternId` or `source` params for prefill)

### Key Features Implemented

✅ **Projects**
- List view with status filter (active/paused/finished/all)
- Create project with pattern metadata, yarn info, color palettes
- Project detail with basic counters (round/height)
- Quick adjust buttons on cards
- Pattern source tracking
- Editable notes and snippets

✅ **Pattern Library**
- Curated pattern catalog (6 sample patterns)
- Search & filter (difficulty, mood, tags)
- Pattern cards with preview
- "Add to project" flow (prefills create form)
- "Preview instructions" flow (loads into Pattern Maker)

✅ **Pattern Maker**
- Metadata editor (title, description, difficulty, yarn, hook, gauge)
- Tags and palette picker
- Structured sections with rows
- Quick row templates (+6 inc, even, -6 dec)
- Live preview with copy-to-clipboard
- "Send to Projects" integration
- Persistent draft (auto-saves)
- Can load from Pattern Library

✅ **Home Dashboard**
- Hero section with CTAs
- Project statistics (total, active, finished)
- Quick actions (+1 round, open notes, pattern ideas)
- Active project recap
- Recently added projects list

✅ **Settings**
- Theme mode selector (system/light/dark)
- "Cycle theme" button

✅ **Theming**
- Light/dark mode support
- Custom color palette
- Consistent design system (Card, Screen components)

### Known Gaps & Issues

❌ **Missing from user requirements:**
- **Counters don't persist across app restarts properly** (basic round counter exists but needs robust implementation)
- **No stitch counter** (only round counter exists)
- **No yarn stash management** (completely missing)
- **No photos/image support** (missing)
- **No project journal/timeline** (only roundLog, not user-facing)
- **No voice commands** (not started)
- **No PDF/document picker** (patterns are mock data only)
- **No gauge calculator or yarn estimator**
- **Community is just a placeholder**

❌ **Structural issues:**
- Too many top-level tabs (6) - overwhelming
- Pattern Maker as a separate tab feels disconnected
- No clear "Add Project" CTA from patterns
- Counter UX needs work (persistence, larger buttons, manual edit)
- No multi-part counters (left/right sleeves, etc.)

---

## 2. Restructuring Plan

Based on user survey feedback, we need to:
1. Make the interface less overwhelming
2. Distribute features logically across tabs
3. Make onboarding easier
4. Add missing core features (yarn stash, robust counters, photos, journal)

### Phase 1: Skeleton Restructure

**New tab structure (5 tabs max):**
```
├── Home          (Dashboard - project stats, quick actions)
├── Projects      (List + Detail - primary workspace)
├── Patterns      (Library + Stash sub-tabs)
├── Community     (Social features - future)
└── Settings      (Preferences + utilities)
```

**Key changes:**
- Remove "Create Pattern" as a top-level tab
  - Move to `/patterns` as a floating action or sub-route
  - Or make it a button within project detail ("Build custom pattern")
- Combine Pattern Library + Yarn Stash under "Patterns" tab with sub-navigation
- Simplify Home to be truly welcoming (not redundant with Projects)

### Phase 2: Core MVP Features (Priority Order)

#### 2.1 Robust Counters (CRITICAL)
- [ ] Persistent stitch + row counters per project
- [ ] Large, thumb-friendly +1/-1 buttons
- [ ] Quick increment buttons (+5, +10, +20)
- [ ] Manual edit (tap number to type)
- [ ] Counter state survives app background/lock
- [ ] Visual feedback (haptics if available)
- [ ] Optional: Multi-part counters (for symmetric pieces)

#### 2.2 Yarn Stash Management (NEW)
- [ ] `/patterns/stash` route (sub-tab or nested)
- [ ] Yarn data model:
  ```typescript
  type Yarn = {
    id: string;
    name: string;
    brand?: string;
    color: string;
    weightCategory: string; // 'Lace', 'DK', 'Worsted', etc.
    metersPerSkein: number;
    yardagePerSkein: number;
    skeinsOwned: number;
    skeinsReserved: number; // Allocated to projects
    notes?: string;
    createdAt: string;
  };
  ```
- [ ] CRUD for yarn entries
- [ ] Filter by weight/color
- [ ] Summary stats ("You have X yarns, Y total meters")
- [ ] Link yarn to projects (track usage)

#### 2.3 Project Journal & Timeline
- [ ] Add `journalEntries` to Project type:
  ```typescript
  type JournalEntry = {
    id: string;
    projectId: string;
    type: 'note' | 'progress' | 'finished' | 'photo';
    text?: string;
    photoUri?: string;
    createdAt: string;
  };
  ```
- [ ] Display timeline in project detail
- [ ] Auto-log when project marked finished
- [ ] Manual "Add note" button

#### 2.4 Photos Support
- [ ] Add `expo-image-picker` dependency
- [ ] Photo picker button in project detail
- [ ] Display photos in journal timeline
- [ ] Store photo URIs in project data

#### 2.5 Pattern Import (Phase 1)
- [ ] Keep current link/text import
- [ ] Add `expo-document-picker` for PDF metadata
- [ ] Store PDF path/URI (no parsing yet)
- [ ] Show PDF in webview or external viewer
- [ ] Add TODO comments for future OCR/AI parsing

### Phase 3: Stubs for Future Features

Document interfaces and add placeholders for:
- [ ] Voice commands (stub hooks/UI)
- [ ] Advanced pattern parsing (AI/OCR)
- [ ] Diagram tools (canvas/drawing)
- [ ] Gauge calculator
- [ ] Sync/backend integration
- [ ] Community features (share/sell patterns)

### Phase 4: Quality of Life
- [ ] "Keep screen awake" toggle (expo-keep-awake)
- [ ] Improved theming (more color options?)
- [ ] Onboarding flow for first-time users
- [ ] Export project data (JSON/PDF)
- [ ] Backup/restore functionality

---

## 3. Implementation Order

**Step 1: Analyze & Document** ✅
- Create this ARCHITECTURE.md

**Step 2: Skeleton Refactor**
- Restructure tabs (5 instead of 6)
- Add `/patterns/stash` route
- Move Pattern Maker to `/patterns/create` or modal

**Step 3: MVP Features (one at a time)**
1. Robust counters
2. Yarn stash
3. Photos
4. Journal
5. Pattern import improvements

**Step 4: Stubs & Placeholders**
- Add interface definitions
- Add TODO comments
- Create placeholder screens/buttons

**Step 5: Polish & Test**
- Cross-platform testing
- Performance optimization
- User testing & feedback

---

## 4. File Organization Rules

### Naming Conventions
- **Components**: PascalCase (`ProjectCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`usePersistentCounter.ts`)
- **Stores**: camelCase with `use` prefix (`useProjectsStore.ts`)
- **Types**: PascalCase for type names, lowercase file names (`types/yarn.ts`)
- **Utils**: camelCase (`lib/counter.ts`)

### Component Structure
```tsx
// 1. Imports (external, then internal)
import { useState } from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Project } from '@/types/project';

// 2. Types/interfaces
type ProjectCardProps = {
  project: Project;
  onPress: () => void;
};

// 3. Component
export function ProjectCard({ project, onPress }: ProjectCardProps) {
  // ...
}

// 4. Styles
const styles = StyleSheet.create({
  // ...
});
```

### When to Extract Components
- Component > 200 lines
- Logic reused 2+ times
- Clear single responsibility

### When to Create New Hooks
- Stateful logic reused across components
- Complex side effects (counters, persistence)
- Platform-specific behavior

---

## 5. Testing Strategy

**Manual Testing Checklist:**
- [ ] App launches without crash on iOS/Android/Web
- [ ] Navigation works between all tabs
- [ ] State persists across app restarts
- [ ] Counters don't reset on background/lock
- [ ] Forms validate and save correctly
- [ ] Theme switching works
- [ ] No console warnings/errors

**Future Automated Testing:**
- Unit tests for stores/hooks
- Component tests for critical UI
- E2E tests for core flows

---

## 6. Performance Considerations

- Use `useMemo` for expensive computations (e.g., filtered lists)
- Use `useCallback` for event handlers passed to children
- Avoid inline object/array literals in render
- Debounce text inputs that update stores
- Lazy load images
- Virtualize long lists (FlatList)

---

## 7. Accessibility

- All interactive elements have accessible labels
- Color contrast meets WCAG AA
- Text scales with system font size settings
- VoiceOver/TalkBack support (future)

---

## 8. Open Questions

1. **Should we support multiple active counters per project?**
   - E.g., left/right sleeve counters that sum to total
   - Complexity vs. usefulness trade-off

2. **How deep should pattern parsing go in Phase 1?**
   - Just metadata extraction from PDFs?
   - Or full text parsing for stitches/rows?

3. **Community features: marketplace or free sharing only?**
   - Affects data model and auth requirements

4. **Offline-first or sync-first architecture?**
   - Current: fully offline (AsyncStorage only)
   - Future: sync to cloud?

---

## 9. Dependencies

**Current:**
```json
{
  "expo": "~54.0.25",
  "expo-router": "~6.0.15",
  "react-native": "0.81.5",
  "zustand": "^5.0.8",
  "@react-native-async-storage/async-storage": "2.2.0",
  "expo-linear-gradient": "^15.0.7",
  "expo-clipboard": "^8.0.7"
}
```

**To Add:**
- `expo-image-picker` (photos)
- `expo-document-picker` (PDFs)
- `expo-keep-awake` (screen wake lock)
- `react-native-haptic-feedback` or `expo-haptics` (counter feedback)

---

## 10. Security & Privacy

- All data stored locally (no cloud yet)
- No PII collection
- Photos stored in app sandbox only
- Future: encryption for cloud sync

---

## Conclusion

The current app has a solid foundation with:
- Clean routing (Expo Router)
- State management (Zustand + persistence)
- Theming system
- Basic project tracking
- Pattern library

**Next steps:** Follow the restructuring plan to make the interface less overwhelming, add missing core features (yarn stash, robust counters, photos, journal), and prepare stubs for advanced features.





