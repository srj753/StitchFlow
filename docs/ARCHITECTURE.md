# Crochet App Architecture

**Last updated:** December 2024

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
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectTabs.tsx
│   │   ├── TrackView.tsx
│   │   ├── PatternView.tsx
│   │   ├── StudioView.tsx
│   │   └── AssistantView.tsx
│   ├── patterns/
│   │   └── PatternCard.tsx
│   ├── counters/
│   │   ├── Counter.tsx
│   │   └── LinkedCounterGroup.tsx
│   ├── journal/
│   │   └── JournalEntry.tsx
│   ├── photos/
│   │   └── PhotoLightbox.tsx
│   ├── ui/
│   │   ├── LoadingSpinner.tsx
│   │   ├── Toast.tsx
│   │   └── ToastProvider.tsx
│   └── color/
│       └── ColorPickerModal.tsx
├── store/                 # Zustand state management
│   ├── useProjectsStore.ts        # Project data & actions (with counters, journal, photos)
│   ├── usePatternStore.ts         # Pattern library & imported patterns
│   ├── usePatternDraftStore.ts    # Pattern maker drafts
│   ├── useYarnStore.ts            # Yarn stash management
│   ├── useAppearanceStore.ts      # Theme preferences (light/dark/custom accent)
│   └── useSettingsStore.ts        # App settings (AI toggle, screen wake, etc.)
├── types/                 # TypeScript type definitions
│   ├── project.ts
│   └── pattern.ts
├── hooks/                 # Custom React hooks
│   ├── useTheme.ts                # Theme hook with custom accent support
│   ├── useEffectiveColorScheme.ts  # System theme detection
│   ├── useToast.tsx                # Toast notification system
│   ├── useKeepScreenAwake.ts       # Screen wake lock
│   └── useVoiceCommandStub.ts      # Voice command placeholder
├── lib/                   # Utilities & helpers
│   ├── storage.ts         # AsyncStorage (web) - synchronous getItem for Zustand
│   ├── storage.native.ts  # AsyncStorage (native)
│   ├── theme.ts           # Theme system with custom accent colors
│   ├── color.ts           # Color utilities
│   ├── patternDraft.ts    # Pattern draft utilities
│   ├── patternParser.ts   # Pattern text parsing for checklists
│   └── dataExport.ts      # Data export/import functionality
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
  currentRound: number;           // Legacy counter (kept for backwards compat)
  currentHeightInches: number;
  
  // New counter system
  counters: ProjectCounter[];      // Multiple counters per project
  
  notes?: string;
  patternSnippet?: string;
  status: 'active' | 'paused' | 'finished';
  sections: ProjectSection[];
  roundLog: RoundLogEntry[];      // History of counter changes (legacy)
  
  // New features
  journal: JournalEntry[];         // Project timeline/journal
  photos: string[];                // Array of photo URIs
  thumbnail?: string;              // Project thumbnail image
  timeSpentMinutes: number;        // Time tracking
  linkedYarns: ProjectYarn[];     // Yarn allocation to project
  colorPalette?: string[];
  
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  sourceUrl?: string;
};

type ProjectCounter = {
  id: string;
  projectId: string;
  type: 'row' | 'stitch' | 'custom';
  label: string;                  // e.g., "Main body", "Left sleeve"
  currentValue: number;
  targetValue?: number;
  lastUpdated: string;
  linkedCounterIds?: string[];    // IDs of counters linked to this one (for auto-sum)
};

type JournalEntry = {
  id: string;
  projectId: string;
  type: 'note' | 'progress' | 'finished' | 'photo' | 'milestone';
  title?: string;
  text?: string;
  photoUri?: string;
  metadata?: {
    roundsCompleted?: number;
    heightAchieved?: number;
    [key: string]: any;
  };
  createdAt: string;
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
  fileUri?: string;                // PDF file URI for imported patterns
  snippet?: string;
  estimatedRounds?: number;
  targetHeightInches?: number;
  notes?: string;
  hero?: boolean;
  patternSourceType?: 'external' | 'built-in' | 'my-pattern';
  sourceType?: 'catalog' | 'imported' | 'draft';
  importedAt?: string;
  rowChecklist?: string[];         // Array of completed row IDs (for interactive checklist)
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
   - Projects array with full project data
   - Active project ID
   - **Counter Actions**: addCounter, updateCounter, updateCounterLabel, deleteCounter, linkCounters, unlinkCounter
   - **Journal Actions**: addJournalEntry, deleteJournalEntry
   - **Photo Actions**: addPhoto, deletePhoto
   - **Yarn Actions**: linkYarn, updateLinkedYarn, unlinkYarn
   - **Legacy Actions**: incrementRound, incrementHeight (kept for backwards compat)
   - Persisted to `knotiq-projects` with migration support

2. **usePatternStore**
   - Patterns array (imported patterns)
   - Actions: addPattern, deletePattern, toggleRowChecklist, clearRowChecklist
   - Persisted to `knotiq-patterns`

3. **useYarnStore**
   - Yarns array (yarn stash inventory)
   - Actions: addYarn, updateYarn, deleteYarn
   - Persisted to `knotiq-yarns`

4. **usePatternDraftStore**
   - Single draft object (auto-saves)
   - Actions: setMeta, addSection, addRow, updateRow, etc.
   - Persisted to `knotiq-pattern-draft`

5. **useAppearanceStore**
   - Theme mode (system/light/dark)
   - Custom accent color support
   - Persisted to `knotiq-appearance`

6. **useSettingsStore**
   - AI Assistant toggle
   - Keep screen awake setting
   - Voice hints enabled
   - Persisted to `knotiq-settings`

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
- Project detail with tabbed interface (Track, Pattern, Studio, AI)
- **Advanced Counter System**:
  - Multiple counters per project (row, stitch, custom)
  - Large, thumb-friendly increment buttons (+1, +5, +10, +20)
  - Manual edit (tap to type)
  - **Linked Counters**: Link multiple counters (e.g., left/right sleeves) with auto-sum
  - Visual progress bars for targets
  - Haptic feedback on increments
- Quick adjust buttons on cards
- Pattern source tracking
- Editable notes and snippets
- **Journal/Timeline**: Add notes, progress updates, photos with timestamps
- **Photo Gallery**: Add progress photos, view in lightbox
- **Yarn Linking**: Link yarn from stash to projects, track usage

✅ **Pattern Library**
- Curated pattern catalog (sample patterns)
- Import patterns (PDF or reference URL)
- Search & filter (difficulty, mood, tags)
- Pattern cards with preview
- **Interactive Row Checklist**: Check off completed rows in pattern view
- Pattern detail with Smart View (parsed checklist) and Original Source tabs
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

✅ **AI Assistant (New)**
- **Provider Support**: OpenAI and Groq (for fast/cheap inference)
- **Vision Capabilities**: Extract patterns from photos/screenshots
- **Smart Import**:
  - **PDF**: Intelligent text extraction
  - **Web**: URL scraping and content cleaning
  - **Images**: Vision-based pattern recognition
- **Configurable**: User API keys stored securely in Settings

✅ **Settings**
- Theme mode selector (system/light/dark)
- Custom accent color picker
- AI Assistant toggle (controls visibility of AI tab in projects)
- Keep screen awake toggle
- Unit converter tool
- Data export/import (JSON backup)
- Profile summary view

✅ **Theming**
- Light/dark mode support with system preference detection
- Custom accent color support
- Consistent design system (Card, Screen components)
- Full dark mode optimization across all screens
- Modern UI with glass-morphism effects, rounded corners, consistent spacing

✅ **UX Enhancements**
- Loading states with spinners for async operations
- Toast notifications for success/error feedback
- Haptic feedback on counter increments
- Smooth animations and transitions
- Responsive layouts for mobile and web

### Known Gaps & Issues

✅ **Completed Core Features:**
- ✅ **Robust Counters**: Multiple counters per project with persistence, large buttons, manual edit, haptic feedback
- ✅ **Linked Counters**: Multi-part counter support (e.g., left/right sleeves) with auto-sum
- ✅ **Yarn Stash Management**: Full CRUD for yarn inventory, linking to projects
- ✅ **Photos Support**: Image picker, photo gallery, lightbox viewer
- ✅ **Project Journal/Timeline**: Notes, progress updates, photos with timestamps
- ✅ **Pattern Import**: PDF/document picker, reference URL support
- ✅ **Interactive Pattern Checklists**: Row-by-row completion tracking in pattern view
- ✅ **Loading States**: Spinners and toast notifications for async operations

❌ **Remaining Gaps:**
- **Voice commands** (stub exists, not implemented)
- **Advanced pattern parsing** (AI/OCR for PDFs - basic text parsing exists)
- **Gauge calculator** (not started)
- **Yarn estimator** (basic exists, could be enhanced)
- **Community features** (UI exists, backend not connected)

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

#### 2.1 Robust Counters (CRITICAL) ✅ COMPLETED
- [x] Persistent stitch + row counters per project
- [x] Large, thumb-friendly +1/-1 buttons
- [x] Quick increment buttons (+5, +10, +20)
- [x] Manual edit (tap number to type)
- [x] Counter state survives app background/lock
- [x] Visual feedback (haptics if available)
- [x] Multi-part counters (for symmetric pieces) - **Linked Counters feature**

#### 2.2 Yarn Stash Management (NEW) ✅ COMPLETED
- [x] `/patterns/stash` route (sub-tab or nested)
- [x] Yarn data model implemented
- [x] CRUD for yarn entries
- [x] Filter by weight/color
- [x] Summary stats ("You have X yarns, Y total meters")
- [x] Link yarn to projects (track usage)

#### 2.3 Project Journal & Timeline ✅ COMPLETED
- [x] `JournalEntry` type added to Project
- [x] Display timeline in project detail (TrackView)
- [x] Auto-log when project marked finished
- [x] Manual "Add note" button
- [x] Support for multiple entry types (note, progress, finished, photo, milestone)

#### 2.4 Photos Support ✅ COMPLETED
- [x] `expo-image-picker` dependency added
- [x] Photo picker button in project detail
- [x] Display photos in journal timeline
- [x] Photo gallery with lightbox viewer
- [x] Store photo URIs in project data
- [x] Horizontal scrollable photo gallery

#### 2.5 Pattern Import (Phase 1) ✅ COMPLETED
- [x] Link/text import supported
- [x] `expo-document-picker` for PDF metadata
- [x] Store PDF path/URI
- [x] Show PDF in webview or external viewer
- [x] Basic pattern text parsing for interactive checklists
- [ ] Advanced OCR/AI parsing (future enhancement)

### Phase 3: Stubs for Future Features

Document interfaces and add placeholders for:
- [ ] Voice commands (stub hooks/UI)
- [ ] Advanced pattern parsing (AI/OCR)
- [ ] Diagram tools (canvas/drawing)
- [ ] Gauge calculator
- [ ] Sync/backend integration
- [ ] Community features (share/sell patterns)

### Phase 4: Quality of Life ✅ MOSTLY COMPLETED
- [x] "Keep screen awake" toggle (expo-keep-awake)
- [x] Improved theming (custom accent colors)
- [ ] Onboarding flow for first-time users (not started)
- [x] Export project data (JSON)
- [x] Backup/restore functionality (import/export JSON)
- [x] Loading states and toast notifications
- [x] Unit converter tool

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

1. **Should we support multiple active counters per project?** ✅ IMPLEMENTED
   - ✅ Multiple counters per project supported
   - ✅ Linked counters feature allows left/right sleeve counters that sum to total
   - ✅ Visual indicators show linked counter groups

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
  "expo-clipboard": "^8.0.7",
  "expo-image-picker": "^16.0.0",
  "expo-document-picker": "^12.0.0",
  "expo-keep-awake": "^14.0.0",
  "expo-haptics": "^14.0.0",
  "expo-sharing": "^13.0.0",
  "react-native-webview": "^15.0.0"
}
```

---

## 10. Security & Privacy

- All data stored locally (no cloud yet)
- No PII collection
- Photos stored in app sandbox only
- Future: encryption for cloud sync

---

## 11. Recent Architectural Changes (December 2024)

### New Features & Components

#### Linked Counters System
- **Type Extension**: `ProjectCounter` now includes `linkedCounterIds?: string[]`
- **Store Actions**: `linkCounters()` and `unlinkCounter()` in `useProjectsStore`
- **Component**: `LinkedCounterGroup` displays linked counters with auto-sum total
- **UI Pattern**: Linked counters are visually grouped with accent borders and link indicators
- **Use Case**: Perfect for symmetric pieces (left/right sleeves, front/back panels)

#### Pattern Row Checklist
- **Type Extension**: `Pattern` now includes `rowChecklist?: string[]`
- **Store Actions**: `toggleRowChecklist()` and `clearRowChecklist()` in `usePatternStore`
- **Parser**: `lib/patternParser.ts` extracts rows/rounds from pattern text
- **UI Pattern**: Interactive checklist in Pattern Detail screen with checkboxes and strikethrough
- **Persistence**: Checklist state persists across app restarts

#### AI Service & Pattern Extraction
- **Service**: `lib/aiService.ts` manages LLM interactions (OpenAI/Groq)
- **Architecture**: Unified interface for multiple providers and fallbacks
- **Capabilities**: Text analysis, Vision (image-to-pattern), PDF parsing
- **Extraction Pipeline**:
  1. **Input**: URL, PDF, or Image
  2. **Processing**: Scraper/OCR/Vision API extracts raw content
  3. **Analysis**: LLM structures data into standard Pattern schema
  4. **Output**: Pre-filled Pattern form

### Storage Architecture Updates

#### Synchronous Web Storage
- **Issue**: Zustand persistence on web had hydration lag with async `localStorage`
- **Solution**: `lib/storage.ts` now uses synchronous `getItem()` for web
- **Impact**: Stores rehydrate instantly on web, fixing data loading issues

#### Data Migration Support
- **Pattern**: Store migrations handled via version numbers in persist config
- **Example**: `useProjectsStore` includes migration logic for new fields (`thumbnail`, `timeSpentMinutes`)

### Component Architecture Patterns

#### Counter System
```
Counter (standalone)
  ├── Individual counter with increment buttons
  └── Supports rename, delete, manual edit

LinkedCounterGroup (grouped)
  ├── Displays multiple linked counters
  ├── Shows auto-calculated total
  └── Individual increment controls per counter
```

#### Pattern View System
```
PatternView (project context)
  ├── Parses project.patternSnippet
  └── Interactive checklist (local state)

Pattern Detail (library context)
  ├── Parses pattern.snippet
  └── Interactive checklist (persisted in pattern.rowChecklist)
```

### State Management Patterns

#### Store Action Naming
- **CRUD**: `add*`, `update*`, `delete*` for standard operations
- **Toggle**: `toggle*` for boolean/array toggles
- **Link**: `link*`, `unlink*` for relationship management

#### Persistence Strategy
- All stores use `createJSONStorage` with platform-specific storage
- Sets converted to arrays for JSON serialization
- Migration functions handle schema changes

## Conclusion

The current app has a solid foundation with:
- Clean routing (Expo Router)
- State management (Zustand + persistence with migrations)
- Theming system (light/dark/custom accent)
- Advanced project tracking (counters, journal, photos, yarn linking)
- Pattern library with interactive checklists
- Comprehensive UX enhancements (loading states, toasts, haptics)

**Recent Achievements:**
- ✅ Linked counters for multi-part projects
- ✅ Interactive pattern row checklists
- ✅ Loading states and toast notifications
- ✅ Full dark mode optimization
- ✅ Web app compatibility improvements

**Next steps:** Continue polishing UX, add advanced pattern parsing (AI/OCR), implement voice commands, and connect community features to backend.





