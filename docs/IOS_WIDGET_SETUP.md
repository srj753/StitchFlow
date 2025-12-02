# iOS Widget Setup Guide

This document describes how to implement iOS home screen widgets for StitchFlow. Widgets require native iOS code and cannot be fully implemented in Expo Go.

## Overview

iOS widgets allow users to:
- View their active project counter on the home screen
- Quick increment the counter directly from the widget
- See project progress at a glance

## Requirements

- iOS 14+ for basic widgets
- iOS 16+ for interactive widgets (button taps)
- Native iOS development (Swift)
- Expo development build (not Expo Go)

## Implementation Steps

### 1. Create Widget Extension

1. In Xcode, add a new Widget Extension target:
   - File → New → Target
   - Choose "Widget Extension"
   - Name it "StitchFlowWidget"

2. Configure the widget:
   - Set deployment target to iOS 14.0+
   - Enable "Include Configuration Intent" for user customization

### 2. Widget Data Model

The widget needs to read project data from the app's shared storage:

```swift
// WidgetData.swift
import WidgetKit
import SwiftUI

struct ProjectData: Codable {
    let projectId: String
    let projectName: String
    let counterId: String
    let counterLabel: String
    let currentValue: Int
    let targetValue: Int?
}

class WidgetDataManager {
    static let shared = WidgetDataManager()
    private let userDefaults = UserDefaults(suiteName: "group.com.stitchflow.app")
    
    func saveActiveProject(_ project: ProjectData) {
        if let encoded = try? JSONEncoder().encode(project) {
            userDefaults?.set(encoded, forKey: "activeProject")
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
    
    func getActiveProject() -> ProjectData? {
        guard let data = userDefaults?.data(forKey: "activeProject"),
              let project = try? JSONDecoder().decode(ProjectData.self, from: data) else {
            return nil
        }
        return project
    }
}
```

### 3. Widget UI

```swift
// StitchFlowWidget.swift
import WidgetKit
import SwiftUI

struct StitchFlowWidget: Widget {
    let kind: String = "StitchFlowWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ProjectProvider()) { entry in
            WidgetView(entry: entry)
        }
        .configurationDisplayName("Active Project")
        .description("View and update your active project counter.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct ProjectProvider: TimelineProvider {
    func placeholder(in context: Context) -> ProjectEntry {
        ProjectEntry(date: Date(), project: nil)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (ProjectEntry) -> ()) {
        let entry = ProjectEntry(date: Date(), project: WidgetDataManager.shared.getActiveProject())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<ProjectEntry>) -> ()) {
        let project = WidgetDataManager.shared.getActiveProject()
        let entry = ProjectEntry(date: Date(), project: project)
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

struct ProjectEntry: TimelineEntry {
    let date: Date
    let project: ProjectData?
}

struct WidgetView: View {
    var entry: ProjectEntry
    
    var body: some View {
        if let project = entry.project {
            VStack(alignment: .leading, spacing: 8) {
                Text(project.projectName)
                    .font(.headline)
                    .lineLimit(1)
                
                Text(project.counterLabel)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack {
                    Text("\(project.currentValue)")
                        .font(.system(size: 32, weight: .bold))
                    
                    if let target = project.targetValue {
                        Text("/ \(target)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
                
                if let target = project.targetValue {
                    ProgressView(value: Double(project.currentValue), total: Double(target))
                }
            }
            .padding()
        } else {
            VStack {
                Text("No Active Project")
                    .font(.headline)
                    .foregroundColor(.secondary)
            }
            .padding()
        }
    }
}
```

### 4. Interactive Widget (iOS 16+)

For button taps in the widget:

```swift
// Add App Intent
import AppIntents

struct IncrementCounterIntent: AppIntent {
    static var title: LocalizedStringResource = "Increment Counter"
    
    func perform() async throws -> some IntentResult {
        // Call app to increment counter
        if let url = URL(string: "stitchflow://increment-counter") {
            await UIApplication.shared.open(url)
        }
        return .result()
    }
}

// Update widget view with button
Button(intent: IncrementCounterIntent()) {
    Image(systemName: "plus.circle.fill")
        .font(.title)
}
```

### 5. App Group Configuration

1. Enable App Groups in both app and widget targets:
   - Signing & Capabilities → + Capability → App Groups
   - Use: `group.com.stitchflow.app`

2. Update app to save data to shared container:

```typescript
// In React Native/Expo app
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save active project data for widget
async function updateWidgetData(project: Project, counter: ProjectCounter) {
  const widgetData = {
    projectId: project.id,
    projectName: project.name,
    counterId: counter.id,
    counterLabel: counter.label,
    currentValue: counter.currentValue,
    targetValue: counter.targetValue,
  };
  
  // Save to shared UserDefaults (requires native module)
  // Or use a native module to write to App Group
}
```

### 6. Deep Linking for Widget Actions

Handle widget button taps via deep linking:

```typescript
// app/_layout.tsx or app/index.tsx
import * as Linking from 'expo-linking';

useEffect(() => {
  const subscription = Linking.addEventListener('url', handleDeepLink);
  return () => subscription.remove();
}, []);

function handleDeepLink(event: { url: string }) {
  const { path, queryParams } = Linking.parse(event.url);
  
  if (path === 'increment-counter') {
    // Increment the active project counter
    const { projectId, counterId } = queryParams;
    if (projectId && counterId) {
      useProjectsStore.getState().updateCounter(
        projectId as string,
        counterId as string,
        currentValue + 1
      );
    }
  }
}
```

## Testing

1. Build development build: `npx expo run:ios`
2. Add widget to home screen (long press home screen → + → StitchFlow)
3. Test widget updates when counter changes
4. Test button taps (iOS 16+)

## Limitations

- Widgets cannot directly modify app data (must use deep links)
- Widget updates are limited by iOS (battery optimization)
- Interactive widgets require iOS 16+
- Requires native iOS development

## Future Enhancements

- Multiple widget sizes (small, medium, large)
- Widget configuration screen
- Multiple project widgets
- Widget complications for Apple Watch






