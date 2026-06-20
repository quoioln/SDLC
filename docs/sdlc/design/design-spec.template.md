# Design Spec: [Epic Name]

## Overview
[Brief description of what this design covers and the problem it solves]

## Screen Inventory

| # | Screen / Page | Purpose | Key Elements |
|---|--------------|---------|--------------|
| 1 | | | |

## User Flows

### Flow 1: [Flow Name]
1. User lands on [screen]
2. User [action] → [result]
3. ...

**Happy path:** ...
**Error states:** ...

## Component Hierarchy

```
App
├── Layout
│   ├── Header (nav, user menu)
│   ├── Sidebar (optional)
│   └── Main Content
│       ├── [Component A]
│       └── [Component B]
└── Footer
```

## Screen Details

### Screen: [Name]
- **URL / Route:** `/path`
- **Purpose:** ...
- **Layout:** [description or ASCII wireframe]
- **Components:** [list key components]
- **Interactions:** [click, hover, form submit behaviors]
- **Data:** [what data is displayed / submitted]

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|---------------|
| Mobile | < 768px | Single column, hamburger nav |
| Tablet | 768–1024px | ... |
| Desktop | > 1024px | Full layout |

## Design Tokens (required)

- **Primary color:** ...
- **Typography:** ...
- **Spacing:** ...

## UI States

| State | Screen / Component | Behavior |
|-------|--------------------|----------|
| Loading | | |
| Empty | | |
| Error | | |
| Success | | |

## Accessibility (WCAG 2.1 AA)
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (large text / UI components)
- [ ] Full keyboard navigation + visible focus states
- [ ] Semantic structure / ARIA where needed; alt text for images
- [ ] Touch targets ≥ 44×44px

## Internationalization
- [ ] Layout tolerates ~+30–40% text expansion
- [ ] RTL supported (logical layout, mirrored where needed)
- [ ] Locale-aware date / number / currency formats
- [ ] No text baked into images

## Anti AI Checklist
- [ ] No generic/templated layouts — design feels unique and intentional
- [ ] No stock AI illustrations — use real or custom imagery
- [ ] Asymmetry and visual interest — not perfectly symmetric grids
- [ ] Brand-specific colors, typography, spacing — not default palettes
- [ ] Human-feeling micro-interactions and copy

## Notes
[Any additional context, constraints, or decisions]
