# Comprehensive Testing Guide for KnotIQ

**Last Updated:** November 21, 2024  
**Version:** Phase 2 Complete

---

## 📋 Table of Contents

1. [Pre-Testing Checklist](#pre-testing-checklist)
2. [Core Feature Testing](#core-feature-testing)
3. [UI/UX Testing](#uiux-testing)
4. [Platform-Specific Testing](#platform-specific-testing)
5. [How to Report Issues](#how-to-report-issues)
6. [Known Issues & Workarounds](#known-issues--workarounds)

---

## 🔍 Pre-Testing Checklist

Before starting, ensure:
- [ ] App launches without crashes on your platform (iOS/Android/Web)
- [ ] No console errors in development mode
- [ ] Theme switching works (light/dark/system)
- [ ] Navigation between tabs is smooth
- [ ] No white screens or frozen states

---

## 🧪 Core Feature Testing

### 1. Home Screen (`/home`)

**Test Steps:**
1. ✅ **Launch app** → Should land on Home tab
2. ✅ **Check stats display** → Shows Active/Paused/Finished project counts
3. ✅ **Active project card** → If you have projects, shows most recent/active
4. ✅ **Quick actions** → Tap "+1 round" on active project
5. ✅ **Recent projects** → Shows last 3 projects with dates
6. ✅ **Create project button** → Navigates to `/projects/create`
7. ✅ **View all projects** → Navigates to `/projects`

**Expected Results:**
- Stats update correctly
- Quick actions work without errors
- Navigation is smooth
- Empty states show helpful messages

**Report If:**
- Stats show incorrect numbers
- Quick actions don't work
- Navigation fails
- Empty states are missing or unhelpful

---

### 2. Projects List (`/projects`)

**Test Steps:**
1. ✅ **View project list** → All projects visible
2. ✅ **Filter by status** → Tap "All", "Active", "Paused", "Finished"
3. ✅ **Project card interactions:**
   - Tap "-1 round" button
   - Tap "+1 round" button
   - Tap "Open" button
4. ✅ **Empty state** → If no projects, shows helpful message with CTA
5. ✅ **Stats display** → Shows correct counts per filter
6. ✅ **Active project hint** → Shows current active project if set

**Expected Results:**
- Filters work correctly
- Quick adjust buttons update counters
- Project cards show correct data (name, status, progress, rounds)
- Progress bars render correctly (no precision errors)
- Empty state has working CTA

**Report If:**
- Filters don't work
- Quick adjust buttons don't respond
- Progress bars show errors or wrong values
- Project cards show incorrect data
- Empty state missing or broken

---

### 3. Project Detail (`/projects/[id]`)

**Test Steps:**

#### 3.1 Project Header
1. ✅ **Project name** → Displays correctly
2. ✅ **Pattern source** → Shows correct type (External/Built-in/My notes)
3. ✅ **Metrics** → Rounds and Height display correctly
4. ✅ **Status badge** → Shows current status

#### 3.2 Counters Section
1. ✅ **Row counter** → Default counter exists
2. ✅ **Stitch counter** → Default counter exists
3. ✅ **Increment buttons** → Test +1, -1, +5, +10, +20, -5, -10
4. ✅ **Haptic feedback** → Feel vibration on button press (iOS/Android)
5. ✅ **Manual edit** → Tap counter value → Enter new number → Save
6. ✅ **Progress bar** → Shows correct percentage if target set
7. ✅ **Add counter** → Creates new custom counter
8. ✅ **Delete counter** → Removes counter (if more than 1 exists)
9. ✅ **Counter persistence** → Close app → Reopen → Counters still correct

**Expected Results:**
- All counter buttons work
- Haptic feedback on native platforms
- Manual edit saves correctly
- Progress bars calculate correctly
- Counters persist after app restart
- Toast notifications appear for actions

**Report If:**
- Counter buttons don't work
- No haptic feedback (iOS/Android)
- Manual edit doesn't save
- Progress bars show wrong values
- Counters reset on app restart
- Toast notifications missing

#### 3.3 Pattern Info Card
1. ✅ **Pattern snippet** → Can edit text
2. ✅ **Pattern notes** → Separate from progress notes
3. ✅ **Progress notes** → Separate from pattern notes
4. ✅ **Save buttons** → Save changes correctly
5. ✅ **External link** → Opens in browser if URL exists

**Expected Results:**
- Text areas are editable
- Notes save correctly
- Links open correctly
- Toast notifications on save

**Report If:**
- Text areas not editable
- Notes don't save
- Links don't work
- No feedback on save

#### 3.4 Yarn & Stash Card
1. ✅ **Link yarn button** → Opens modal
2. ✅ **Yarn selection** → Shows available yarns
3. ✅ **Skein amount** → Can enter quantity
4. ✅ **Confirm link** → Links yarn to project
5. ✅ **Linked yarn display** → Shows linked yarns with quantities
6. ✅ **Adjust skeins** → Can change reserved amount
7. ✅ **Remove link** → Unlinks yarn from project
8. ✅ **Reserved vs available** → Shows correct totals

**Expected Results:**
- Modal opens/closes correctly
- Yarn selection works
- Linking updates stash reservations
- Adjustments work correctly
- Toast notifications appear
- Available skeins calculate correctly

**Report If:**
- Modal doesn't open/close
- Yarn selection broken
- Linking doesn't work
- Adjustments don't save
- Calculations are wrong
- Toast notifications missing

#### 3.5 Photos Section
1. ✅ **Add photo button** → Opens image picker
2. ✅ **Loading state** → Shows spinner while picking
3. ✅ **Photo display** → Shows thumbnails in horizontal scroll
4. ✅ **Tap photo** → Opens lightbox (full-screen)
5. ✅ **Lightbox navigation** → Swipe or use arrows to navigate
6. ✅ **Close lightbox** → Returns to detail view
7. ✅ **Remove photo** → Deletes photo from project
8. ✅ **Empty state** → Shows message when no photos

**Expected Results:**
- Image picker works
- Loading spinner appears
- Photos display correctly
- Lightbox opens/closes smoothly
- Navigation works (swipe/arrows)
- Remove works correctly
- Toast notifications appear

**Report If:**
- Image picker doesn't open
- No loading state
- Photos don't display
- Lightbox doesn't open
- Navigation broken
- Remove doesn't work
- Toast notifications missing

#### 3.6 Journal/Timeline Section
1. ✅ **Add note** → Enter text → Tap "Note" button
2. ✅ **Add milestone** → Enter text → Tap "Milestone" button
3. ✅ **Journal entries** → Display with type badges and timestamps
4. ✅ **Delete entry** → Removes entry from journal
5. ✅ **Empty state** → Shows message when no entries
6. ✅ **Timestamps** → Show relative time (e.g., "2h ago", "Just now")

**Expected Results:**
- Note/milestone creation works
- Entries display correctly
- Delete works
- Timestamps format correctly
- Toast notifications appear

**Report If:**
- Note/milestone creation fails
- Entries don't display
- Delete doesn't work
- Timestamps wrong
- Toast notifications missing

---

### 4. Create Project (`/projects/create`)

**Test Steps:**
1. ✅ **Form fields** → All fields visible and editable:
   - Project name (required)
   - Pattern name (optional)
   - Pattern source type (dropdown)
   - Yarn weight (optional)
   - Hook size (custom input)
   - Target height (optional)
   - Total rounds estimate (optional)
   - Notes (optional)
   - Color palette (color picker)
2. ✅ **Color picker** → Opens modal with:
   - Palette presets
   - Custom color picker (HSV)
   - Can add multiple colors
3. ✅ **Prefill from pattern** → If coming from pattern library, form pre-fills
4. ✅ **Submit** → Creates project and navigates to detail
5. ✅ **Validation** → Name required, shows error if empty
6. ✅ **Toast notification** → Shows success message

**Expected Results:**
- All fields work correctly
- Color picker functional
- Prefill works
- Validation works
- Project created successfully
- Navigation works
- Toast appears

**Report If:**
- Fields don't work
- Color picker broken
- Prefill doesn't work
- Validation missing
- Project creation fails
- Navigation broken
- Toast missing

---

### 5. Patterns Library (`/patterns`)

**Test Steps:**
1. ✅ **Pattern list** → Shows all patterns (catalog + imported)
2. ✅ **Search** → Type in search box → Results filter (debounced)
3. ✅ **Difficulty filter** → Tap "Beginner", "Intermediate", "Advanced"
4. ✅ **Mood filter** → Tap mood chips
5. ✅ **Featured pattern** → Shows at top if available
6. ✅ **Pattern card** → Shows name, designer, difficulty, palette
7. ✅ **Preview instructions** → Opens Pattern Maker with pattern
8. ✅ **Add to project** → Opens Create Project with prefill
9. ✅ **Empty state** → Shows if no patterns match filters

**Expected Results:**
- List displays correctly
- Search works (with debounce)
- Filters work
- Pattern cards show correct data
- Preview works
- Add to project pre-fills correctly
- Empty state helpful

**Report If:**
- List doesn't display
- Search doesn't work
- Filters broken
- Pattern cards wrong
- Preview fails
- Prefill doesn't work
- Empty state missing

---

### 6. Pattern Detail (`/patterns/[id]`)

**Test Steps:**
1. ✅ **Pattern info** → Shows name, designer, difficulty, description
2. ✅ **Overview card** → Shows duration, yarn weight, hook size
3. ✅ **View tabs** → "Smart view" and "Original" tabs
4. ✅ **Smart view** → Shows snippet or placeholder
5. ✅ **Original view** → Shows WebView for URLs or file info
6. ✅ **Use in project** → Opens Create Project with prefill
7. ✅ **Back button** → Returns to patterns list

**Expected Results:**
- Info displays correctly
- Tabs work
- Smart view shows content
- Original view works (WebView or file info)
- Use in project pre-fills
- Navigation works

**Report If:**
- Info missing/wrong
- Tabs don't work
- Smart view broken
- Original view broken
- Prefill doesn't work
- Navigation fails

---

### 7. Yarn Stash (`/patterns/stash`)

**Test Steps:**
1. ✅ **Yarn list** → Shows all yarns
2. ✅ **Stats** → Total skeins, available, total meters
3. ✅ **Search** → Filters by name, brand, color
4. ✅ **Weight filter** → Filter by yarn weight category
5. ✅ **Yarn card** → Shows name, brand, color, weight, skeins
6. ✅ **Yarn estimator** → Enter dimensions → Shows estimate
7. ✅ **Add yarn button** → Navigates to add form
8. ✅ **Tap yarn card** → Opens edit screen
9. ✅ **Empty state** → Shows helpful message with CTA

**Expected Results:**
- List displays correctly
- Stats calculate correctly
- Search works
- Filters work
- Cards show correct data
- Estimator calculates correctly
- Navigation works
- Empty state helpful

**Report If:**
- List doesn't display
- Stats wrong
- Search broken
- Filters don't work
- Cards wrong
- Estimator broken
- Navigation fails
- Empty state missing

---

### 8. Add/Edit Yarn (`/patterns/stash/add`, `/patterns/stash/[id]`)

**Test Steps:**
1. ✅ **Form fields** → All fields visible:
   - Name (required)
   - Brand (optional)
   - Color (text + color picker)
   - Weight category (dropdown)
   - Meters per skein
   - Yardage per skein
   - Skeins owned
   - Price (optional)
   - Notes (optional)
2. ✅ **Color picker** → Opens modal, can select custom color
3. ✅ **Submit** → Saves yarn to stash
4. ✅ **Edit** → Pre-fills form with existing data
5. ✅ **Delete** → Removes yarn (with confirmation)
6. ✅ **Toast notifications** → Success/error messages

**Expected Results:**
- All fields work
- Color picker functional
- Save works
- Edit pre-fills correctly
- Delete works
- Toast notifications appear

**Report If:**
- Fields don't work
- Color picker broken
- Save fails
- Edit doesn't pre-fill
- Delete broken
- Toast missing

---

### 9. Settings (`/settings`)

**Test Steps:**
1. ✅ **Theme selection** → Tap "System", "Light", "Dark"
2. ✅ **Theme cycle** → Tap "Cycle theme" button
3. ✅ **Keep screen awake** → Toggle on/off
4. ✅ **Voice hints** → Toggle on/off
5. ✅ **Export backup** → Tap "Export backup" → File downloads/shares
6. ✅ **Import backup** → Tap "Import backup" → File picker opens → Select file → Confirm
7. ✅ **Profile button** → Navigates to profile screen

**Expected Results:**
- Theme changes work
- Toggles work
- Export creates file
- Import restores data
- Navigation works

**Report If:**
- Theme doesn't change
- Toggles don't work
- Export fails
- Import fails
- Navigation broken

---

### 10. Profile (`/profile`)

**Test Steps:**
1. ✅ **Stats display** → Shows:
   - Total projects
   - Active projects
   - Finished projects
   - Imported patterns
   - Yarn stash entries
2. ✅ **Coming soon section** → Shows future features

**Expected Results:**
- Stats calculate correctly
- Display is readable

**Report If:**
- Stats wrong
- Display broken

---

## 🎨 UI/UX Testing

### Visual Consistency

**Check:**
- [ ] **Spacing** → Consistent padding/margins (16px outer, 12-16px gaps)
- [ ] **Typography** → Consistent font sizes (titles 18-20px, body 13-14px)
- [ ] **Colors** → Theme colors used consistently
- [ ] **Borders** → Consistent border radius (16px for cards, 14px for buttons)
- [ ] **Shadows** → Cards have subtle shadows
- [ ] **Buttons** → Primary buttons use accent color, secondary use border

**Report If:**
- Inconsistent spacing
- Wrong font sizes
- Colors don't match theme
- Borders look wrong
- Shadows missing/too strong
- Buttons look inconsistent

### Responsive Design

**Check:**
- [ ] **Text overflow** → Long text truncates or wraps correctly
- [ ] **Button sizes** → Buttons are thumb-friendly (min 44px height)
- [ ] **Card layout** → Cards don't overflow screen
- [ ] **Scroll behavior** → Scrollable areas work smoothly
- [ ] **Keyboard** → Keyboard doesn't cover inputs

**Report If:**
- Text overflows
- Buttons too small
- Cards overflow
- Scrolling broken
- Keyboard covers inputs

### Empty States

**Check:**
- [ ] **Projects list** → Shows helpful message with CTA
- [ ] **Patterns list** → Shows helpful message
- [ ] **Yarn stash** → Shows helpful message with CTA
- [ ] **Project detail** → Shows messages for empty sections (photos, journal, yarn)

**Report If:**
- Empty states missing
- Messages unhelpful
- CTAs don't work
- Empty states look broken

### Loading States

**Check:**
- [ ] **Photo picker** → Shows spinner while picking
- [ ] **Button disabled** → Buttons disabled during async operations
- [ ] **Toast notifications** → Appear for all actions

**Report If:**
- No loading states
- Buttons not disabled
- Toast notifications missing

### Animations

**Check:**
- [ ] **Toast animations** → Smooth fade in/out
- [ ] **Navigation** → Smooth transitions
- [ ] **Lightbox** → Smooth open/close

**Report If:**
- Animations jerky
- Navigation choppy
- Lightbox broken

---

## 📱 Platform-Specific Testing

### iOS (Expo Go)

**Test:**
- [ ] **Haptic feedback** → Feel vibration on counter buttons
- [ ] **Image picker** → Works with native picker
- [ ] **File sharing** → Export/import works
- [ ] **Safe area** → Content doesn't overlap notch/home indicator
- [ ] **Status bar** → Correct style (light/dark)

**Report If:**
- No haptic feedback
- Image picker broken
- File sharing doesn't work
- Safe area issues
- Status bar wrong

### Android (Expo Go)

**Test:**
- [ ] **Haptic feedback** → Feel vibration on counter buttons
- [ ] **Image picker** → Works with native picker
- [ ] **File sharing** → Export/import works
- [ ] **Back button** → Works correctly
- [ ] **Status bar** → Correct style

**Report If:**
- No haptic feedback
- Image picker broken
- File sharing doesn't work
- Back button broken
- Status bar wrong

### Web (Chrome/Firefox/Safari)

**Test:**
- [ ] **File download** → Export downloads JSON file
- [ ] **File upload** → Import works with file input
- [ ] **Responsive** → Works on different screen sizes
- [ ] **Keyboard navigation** → Tab through elements
- [ ] **Scroll behavior** → Smooth scrolling

**Report If:**
- Download doesn't work
- Upload broken
- Not responsive
- Keyboard navigation broken
- Scrolling issues

---

## 🐛 How to Report Issues

### Issue Report Template

Use this template when reporting issues:

```
**Platform:** [iOS/Android/Web]
**Screen:** [e.g., /projects/[id]]
**Feature:** [e.g., Counter increment]
**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Videos:**
[Attach if possible]

**Console Errors:**
[Copy any error messages]

**Additional Context:**
[Any other relevant information]
```

### Priority Levels

**🔴 Critical (Fix Immediately):**
- App crashes
- Data loss
- Can't create projects
- Counters don't persist

**🟡 High (Fix Soon):**
- UI broken on specific screen
- Feature doesn't work
- Navigation broken
- Toast notifications missing

**🟢 Medium (Fix When Possible):**
- Minor UI inconsistencies
- Small visual bugs
- Performance issues
- Missing animations

---

## ⚠️ Known Issues & Workarounds

### Current Known Issues

1. **Web: Haptic feedback not available**
   - **Status:** Expected (web limitation)
   - **Workaround:** None needed

2. **Web: File sharing uses download instead of share**
   - **Status:** Expected (web limitation)
   - **Workaround:** Download file manually

3. **iOS: Image picker may require permissions**
   - **Status:** Expected
   - **Workaround:** Grant permissions when prompted

---

## ✅ Testing Checklist Summary

### Must Test Before Release

- [ ] App launches without crashes
- [ ] Create project works
- [ ] Counters increment/decrement correctly
- [ ] Counters persist after app restart
- [ ] Add/edit/delete yarn works
- [ ] Link yarn to project works
- [ ] Add photos works
- [ ] Lightbox opens/closes
- [ ] Journal entries work
- [ ] Export/import backup works
- [ ] Theme switching works
- [ ] Navigation works between all screens
- [ ] Toast notifications appear
- [ ] Empty states show helpful messages
- [ ] Search and filters work
- [ ] No console errors

---

## 📝 Testing Notes

- **Test on real devices** when possible (not just simulators)
- **Test with different data states** (empty, few items, many items)
- **Test edge cases** (very long text, special characters, etc.)
- **Test persistence** (close app, reopen, verify data)
- **Test theme switching** in different scenarios
- **Test on different screen sizes** (especially web)

---

**Happy Testing! 🧶**

If you find issues, report them using the template above. The more detail you provide, the faster we can fix them!




