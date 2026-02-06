# Unity Editor Setup Guide - Detective Game

## Prerequisites

1. Unity 2021.3 LTS or newer
2. TextMeshPro package (included by default)

---

## Step 1: Create Unity Project

```
1. Open Unity Hub
2. New Project → 2D (Core) template
3. Project name: ShelockHome
4. Copy ALL files from Assets folder to Unity project Assets folder
```

---

## Step 2: Project Settings

### Player Settings (Edit → Project Settings → Player)

```
- Company Name: YourStudio
- Product Name: Detective Game
- Default Orientation: Portrait
- Resolution: 1080x1920 reference
```

### Quality Settings

```
- Set default quality to "Medium" for mobile
```

---

## Step 3: Create Scenes

### MainMenu Scene

```
1. File → New Scene → Save as "Assets/Scenes/MainMenu"
2. Create structure:

   MainMenu (Scene)
   ├── Main Camera
   ├── EventSystem
   ├── [GameBootstrap] (Empty GO)
   │   └── Add: GameBootstrap.cs
   └── Canvas
       ├── SafeAreaContainer (Add: SafeAreaFitter.cs)
       │   ├── TitleText (TMP)
       │   ├── StartNewButton (Button + TMP)
       │   └── ContinueButton (Button + TMP)
       └── MainMenuController (Add: MainMenuController.cs)
```

### Investigation Scene

```
1. File → New Scene → Save as "Assets/Scenes/Investigation"
2. Create structure:

   Investigation (Scene)
   ├── Main Camera
   ├── EventSystem
   ├── [InvestigationController] (Add: InvestigationController.cs)
   └── Canvas
       ├── SafeAreaContainer (Add: SafeAreaFitter.cs)
       │   ├── TopBar
       │   │   ├── TitleText (TMP)
       │   │   ├── NotebookButton
       │   │   └── SettingsButton (stub)
       │   ├── PanelContainer
       │   │   ├── ScenePanel (Add: ScenePanel.cs)
       │   │   ├── CluesPanel (Add: CluesPanel.cs)
       │   │   ├── SuspectsPanel (Add: SuspectsPanel.cs)
       │   │   ├── DeductionPanel (Add: DeductionPanel.cs)
       │   │   └── NotebookPanel (Add: NotebookPanel.cs)
       │   └── BottomTabBar (Add: BottomTabBar.cs)
       ├── ModalsContainer
       │   ├── ClueDetailModal (Add: ClueDetailModal.cs)
       │   ├── SuspectDetailModal (Add: SuspectDetailModal.cs)
       │   └── ResultModal (Add: ResultModal.cs)
       ├── ToastPopup (Add: ToastPopup.cs)
       └── UIManager (Add: UIManager.cs)
```

---

## Step 4: Canvas Setup

```
1. Select Canvas
2. Canvas Scaler settings:
   - UI Scale Mode: Scale With Screen Size
   - Reference Resolution: 1080 x 1920
   - Screen Match Mode: Match Width Or Height
   - Match: 0.5
```

---

## Step 5: Create Prefabs

### ClueCard Prefab

```
Create: Assets/Prefabs/UI/ClueCard.prefab

ClueCard (160x200, Image - paper texture color #F5E6D3)
├── NameText (TMP, top, bold)
├── TimeText (TMP, small, gray)
└── StarIcon (Image, top-right corner, hidden by default)

Add: Button component to root
```

### SuspectCard Prefab

```
Create: Assets/Prefabs/UI/SuspectCard.prefab

SuspectCard (Full width x 120, Image - paper texture)
├── Avatar (Image, 80x80, left side)
├── NameText (TMP, right of avatar, bold)
└── BioText (TMP, below name, gray, smaller)

Add: Button component to root
```

### TimelineEntry Prefab

```
Create: Assets/Prefabs/UI/TimelineEntry.prefab

TimelineEntry (Full width x 60)
├── Icon (Image, 24x24, left, colored circle)
├── TimeText (TMP, small, 50px width)
└── DescriptionText (TMP, remaining space)
```

### QuestionButton Prefab

```
Create: Assets/Prefabs/UI/QuestionButton.prefab

QuestionButton (Full width x 50, Button)
├── Text (TMP, left-aligned)
└── CheckMark (Image, right, hidden by default)
```

### Hotspot Prefab

```
Create: Assets/Prefabs/Gameplay/Hotspot.prefab

Hotspot (60x60)
├── HotspotImage (Image, circle sprite, yellow with alpha)
└── PulseImage (Image, larger circle, for animation)

Add: HotspotView.cs, Button component
```

---

## Step 6: Create Placeholder Sprites

```
Create simple sprites in Assets/Resources/Placeholders/:

1. bg_office.png (1080x1920, gray/brown room sketch)
2. clue_glass.png (128x128, simple glass icon)
3. clue_bottle.png (128x128, bottle icon)
4. clue_diary.png (128x128, book icon)
5. clue_key.png (128x128, key icon)
6. clue_photo.png (128x128, photo frame icon)
7. clue_cctv.png (128x128, camera icon)
8. avatar_an.png (128x128, female silhouette)
9. avatar_hung.png (128x128, male silhouette)

Tip: Use Unity's built-in sprite shapes or simple colored rectangles
```

---

## Step 7: Wire References

### UIManager

```
1. Select UIManager GameObject
2. Drag panels to corresponding fields:
   - Scene Panel
   - Clues Panel
   - Suspects Panel
   - Deduction Panel
   - Notebook Panel
3. Drag modals to modal fields
4. Drag BottomTabBar
5. Drag ToastPopup
```

### Each Panel

```
1. Add CanvasGroup component
2. Set container reference
3. Set prefab references (clueCardPrefab, etc.)
4. Set emptyText reference
```

### BottomTabBar

```
1. Set up 4 TabButton structures
2. Create icons (simple shapes):
   - Scene: magnifying glass
   - Clues: puzzle piece
   - Suspects: person
   - Deduction: lightbulb
```

---

## Step 8: Build Settings

```
1. File → Build Settings
2. Add scenes:
   - Assets/Scenes/MainMenu (index 0)
   - Assets/Scenes/Investigation (index 1)
3. Switch Platform to Android or iOS
4. Player Settings → Other Settings:
   - Scripting Backend: IL2CPP
   - Target Architectures: ARM64
```

---

## Step 9: Test

```
1. Open MainMenu scene
2. Press Play
3. Click "Start New"
4. Verify:
   - Scene transitions correctly
   - Hotspots appear
   - Clicking collects clues
   - Panels work
   - Modal dialogs open
   - Deduction submission works
```

---

## UI Color Palette (Paper/Corkboard Style)

```css
/* Background colors */
--paper-bg: #f5e6d3;
--paper-dark: #e8d5c4;
--corkboard: #c4956a;

/* Text colors */
--text-primary: #2c1810;
--text-secondary: #5c4033;
--text-muted: #8b7355;

/* Accent colors */
--accent-gold: #d4a84b;
--accent-red: #8b3a3a;
--success: #4a7c59;
--warning: #c99a2e;
```

---

## Troubleshooting

| Issue                | Solution                                        |
| -------------------- | ----------------------------------------------- |
| JSON not loading     | Check StreamingAssets path, use UnityWebRequest |
| TMP not showing      | Import TMP Essentials from Package Manager      |
| Panels not animating | Check RectTransform anchors set to bottom       |
| Hotspots invisible   | Check sprite alpha and RectTransform position   |
| Save not persisting  | Call SaveService.Save() explicitly              |
