# 🧭 COPILOT OPERATIONAL GUIDELINES (UI-COMPONENTS)

## 🧠 PRIME DIRECTIVE

* **Never edit more than one file at a time.**
  Multi-file concurrent edits risk merge conflicts and corruption.
* **Explain your reasoning** while coding — treat coding as teaching.
* Maintain **modularity, clarity, and minimalism**.
  Each file should serve one purpose only and not exceed **200 lines**.

---

## ⚙️ LARGE FILE & COMPLEX CHANGE PROTOCOL

### 🗺️ PLANNING PHASE (MANDATORY)

When modifying large files (>200 lines) or performing complex refactors:

1. Always begin with a **proposed edit plan**:

   ```
   ## PROPOSED EDIT PLAN
   Working with: [filename]
   Total planned edits: [number]
   ```

2. The plan must include:

   * All sections/functions to modify.
   * The purpose and dependencies of each change.
   * The sequence of edits and expected impact.

3. Example:

   ```
   1. Extract ThemeContext logic into a separate file – Purpose: improve modularity.
   2. Refactor Navbar links into a separate NavLinks.tsx – Purpose: reduce component length.
   3. Add type safety to props – Purpose: improve maintainability.
   ```

4. Wait for user confirmation before proceeding with each edit.

---

## 🯩 EDIT EXECUTION PROTOCOL

* Perform **one conceptual change** at a time.
* After each edit, confirm completion:

  > ✅ Completed edit [#] of [total]. Ready for next?
* Show **before/after** snippets and explain changes concisely.
* Stop immediately if unexpected dependencies appear, then **revise the plan**.

---

## 🧱 MODULARIZATION STANDARDS

Every part of the project must be:

* **Reusable:** No duplicated logic or UI.
* **Composable:** Small, independent, functional components.
* **Isolated:** Each file focuses on a single concern.

### ✅ File Size & Structure

* Maximum **200 lines per file**.
* Avoid deeply nested code; extract helpers or hooks when needed.
* Always separate:

  * **UI components** → `/components/ui`
  * **Logic/state hooks** → `/hooks`
  * **Shared utilities** → `/lib/utils.ts`
  * **Type definitions** → `/types`
  * **Page composition** → `/app`

### 📦 Example Layout

```
ui-components/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── user/
│       └── page.tsx
├── components/
│   ├── common/
│   │   ├── navbar/
│   │   │   ├── Navbar.tsx
│   │   │   ├── NavLinks.tsx
│   │   │   └── types.ts
│   │   ├── footer/
│   │   │   ├── Footer.tsx
│   │   │   └── FooterLinks.tsx
│   ├── charts/
│   └── ui/
│       ├── theme/
│       │   ├── ThemeProvider.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── ExpandThemeToggle.tsx
├── hooks/
│   ├── useTheme.ts
│   ├── useFetch.ts
│   └── useMounted.ts
├── lib/
│   └── utils.ts
└── types/
    ├── theme.ts
    └── index.ts
```

---

## 🧹 CODE QUALITY STANDARDS

### ✨ General Rules

* Use **TypeScript everywhere** (no `any`).
* Keep imports clean and sorted.
* Follow **ESLint + Prettier** standards.
* No dead code, console logs, or commented-out blocks.
* Functions must have **descriptive names** and clear parameter types.
* All files require **default exports** unless explicitly multi-exported.

### 📘 Documentation

* Add **JSDoc or TSDoc** comments for all functions, hooks, and components:

  ```ts
  /**
   * Renders the user profile card
   * @param user - The user object containing name and avatar
   */
  const ProfileCard = ({ user }: ProfileCardProps) => ...
  ```
* Each component folder should include:

  * `index.ts` (for re-exports)
  * Optional `types.ts`
  * Minimal inline comments for key logic.

---

## 🎨 FRONTEND ARCHITECTURE RULES

### 🧠 React + Next.js Best Practices

* Use **functional components** only.
* Hooks must start with `use` and never run conditionally.
* Move expensive calculations into `useMemo`.
* Memoize child components with `React.memo` when props rarely change.
* Keep **pages minimal** — only import layout and components.

### 🧱 Styling

* Use **Tailwind CSS** and **shadcn/ui** components.
* Avoid inline styles unless necessary.
* Prefer **utility classes** and **responsive design**.
* Each component should handle **its own layout scope**.

### 🌃 Theming

* Centralize all theme logic inside `/components/ui/theme/`.
* Theme toggles must use context from `ThemeProvider`.
* Avoid state duplication — context > prop drilling.

---

## ⚡ PERFORMANCE OPTIMIZATION

* Prefer **dynamic imports** for large components.
* Use **React.lazy** or **Next.js dynamic()** for heavy modules.
* Cache or memoize expensive operations.
* Optimize all images (use Next/Image with `loading="lazy"`).
* Keep bundle size low with code-splitting.

---

## 🧮 TESTING & STABILITY

* Add **unit tests** for hooks and utilities.
* Keep UI component tests lightweight (snapshot + prop tests).
* Avoid integration test bloat unless critical.

---

## 🧑‍💻 COPILOT CODING ETHICS

* Always explain what you’re doing and why.
* Use meaningful variable names.
* Prioritize readability over cleverness.
* If in doubt: **refactor, don’t patch**.
* Ensure each commit represents a **complete, working unit**.

---

## 🧱 FINAL REQUIREMENTS

✅ Every change should:

* Improve modularity.
* Reduce complexity.
* Maintain consistent formatting.
* Preserve existing behavior.
* Pass `npm run lint` and `npm run build` without warnings.

---