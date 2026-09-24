// Cross-platform wrapper: `npm run build:demo` -> static export with demo data in out/
import { spawnSync } from "node:child_process"

const r = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_DEMO_MODE: "true" },
})
process.exit(r.status ?? 1)
