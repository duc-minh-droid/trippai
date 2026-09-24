"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MapPin, Search } from "lucide-react"
import { cities, type City } from "@/lib/cities"
import { cn } from "@/lib/utils"

interface CitySearchProps {
  label: string
  value: City | null
  onChange: (c: City) => void
  placeholder?: string
  icon?: React.ReactNode
  /** cities that are selectable; others are shown greyed with `disabledHint` */
  allowed?: string[]
  disabledHint?: string
  exclude?: string
  testId?: string
}

function highlight(text: string, q: string) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent text-amber-300">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

export function CitySearch({
  label,
  value,
  onChange,
  placeholder = "Search a city",
  icon,
  allowed,
  disabledHint,
  exclude,
  testId,
}: CitySearchProps) {
  const [query, setQuery] = useState(value?.name ?? "")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => setQuery(value?.name ?? ""), [value])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setQuery(value?.name ?? "")
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [value])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = cities.filter((c) => c.name !== exclude)
    const scored = pool
      .map((c) => {
        const n = c.name.toLowerCase()
        const k = c.country.toLowerCase()
        const rank = !q || q === value?.name.toLowerCase() ? 1 : n.startsWith(q) ? 0 : n.includes(q) ? 1 : k.includes(q) ? 2 : 9
        const ok = !allowed || allowed.includes(c.name)
        return { c, rank, ok }
      })
      .filter((x) => x.rank < 9)
      .sort((a, b) => Number(b.ok) - Number(a.ok) || a.rank - b.rank || a.c.name.localeCompare(b.c.name))
    return scored.slice(0, 7)
  }, [query, allowed, exclude, value])

  useEffect(() => setActive(0), [query])

  const pick = (c: City) => {
    onChange(c)
    setQuery(c.name)
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true)
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const r = results[active]
      if (r?.ok) pick(r.c)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">{label}</label>
      <div
        className={cn(
          "group flex h-12 items-center gap-2.5 rounded-xl border bg-white/[0.04] px-3.5 transition-all duration-200",
          open ? "border-amber-300/60 bg-white/[0.07] shadow-[0_0_0_4px_rgba(251,191,36,0.08)]" : "border-white/10 hover:border-white/20"
        )}
      >
        <span className="text-slate-400 transition-colors group-focus-within:text-amber-300">{icon ?? <Search className="h-4 w-4" />}</span>
        <input
          ref={inputRef}
          data-testid={testId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-full w-full bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={(e) => {
            setOpen(true)
            e.target.select()
          }}
          onKeyDown={onKey}
        />
        {value && <span className="shrink-0 text-xs text-slate-500">{value.country}</span>}
      </div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#0d1328]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {results.map(({ c, ok }, i) => (
              <motion.li
                key={c.name}
                role="option"
                aria-selected={i === active}
                aria-disabled={!ok}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  if (ok) pick(c)
                }}
                className={cn(
                  "relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                  !ok && "cursor-not-allowed opacity-40"
                )}
              >
                {i === active && (
                  <motion.span layoutId={`${listId}-hl`} className="absolute inset-0 rounded-lg bg-white/[0.07]" transition={{ duration: 0.15 }} />
                )}
                <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-amber-400/20 text-[11px] font-semibold text-white/90">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="relative flex-1">
                  <span className="block text-white">{highlight(c.name, query)}</span>
                  <span className="block text-xs text-slate-400">{c.country}</span>
                </span>
                {!ok && disabledHint && <span className="relative text-[10px] uppercase tracking-wider text-slate-400">{disabledHint}</span>}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
