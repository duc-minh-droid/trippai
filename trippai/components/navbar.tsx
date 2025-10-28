"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { Home, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import { useMediaQuery } from "@/hooks/use-media-query"
import { NavLogo } from "./navbar/NavLogo"
import { DesktopNav } from "./navbar/DesktopNav"
import { MobileMenuButton } from "./navbar/MobileMenuButton"
import { MobileSidebar } from "./navbar/MobileSidebar"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/saved-trips", label: "Saved Trips", icon: MapPin },
]

const desktopNavItems = [...navItems]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 767px)")

  // Close sidebar when switching to desktop
  if (!isMobile && isSidebarOpen) {
    setIsSidebarOpen(false)
  }

  // Prefetch routes on mount
  useEffect(() => {
    if (!router || typeof router.prefetch !== "function") return
    try {
      desktopNavItems.forEach((item) => {
        router?.prefetch?.(item.href)
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // ignore
    }
    try {
      desktopNavItems.forEach((item) => {
        try {
          fetch(item.href, { cache: "no-store" }).catch(() => {})
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          // ignore
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // ignore
    }
  }, [router])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      if (!isSidebarOpen) {
        mainContent.style.filter = "blur(8px)"
        mainContent.style.transition = "filter 0.3s ease"
      } else {
        mainContent.style.filter = "none"
      }
    }
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.style.filter = "none"
    }
  }

  return (
    <>
      {/* Desktop Header */}
      {!isMobile && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container flex h-16 max-w-screen-2xl items-center">
            {/* Desktop Logo */}
            <div className="mr-4 hidden md:flex">
              <div className="mr-6">
                <NavLogo showText={true} />
              </div>
            </div>

            {/* Mobile Logo */}
            <div className="flex md:hidden">
              <NavLogo showText={true} />
            </div>

            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              {/* Desktop Navigation */}
              <div className="hidden md:block w-full flex-1 md:w-auto md:flex-none">
                <DesktopNav navItems={desktopNavItems} pathname={pathname} />
              </div>

              <div className="flex items-center space-x-2">
                {/* @@NAVBAR_AUTH_BUTTON@@ */}
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Menu Button */}
      <AnimatePresence>
        {isMobile && !isSidebarOpen && <MobileMenuButton onClick={toggleSidebar} />}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <MobileSidebar navItems={navItems} pathname={pathname} onClose={closeSidebar} />
        )}
      </AnimatePresence>
    </>
  )
}
