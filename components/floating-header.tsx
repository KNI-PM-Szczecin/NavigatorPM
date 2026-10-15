"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
  Accessibility,
  Building2,
  ChevronDown,
  Moon,
  Settings,
  Sun,
} from "lucide-react";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

interface FloatingHeaderProps {
  buildingName?: string;
}

export default function FloatingHeader({
  buildingName = "Wały Chrobrego 1-2",
}: FloatingHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <header className="pointer-events-none fixed top-0 inset-x-0 z-40 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-4">
      {/* =========================================
          WIDOK MOBILNY (< 768px):
          Nazwa budynku rozszerza się na lewo,
          obok 3 okrągłe przyciski (Dostępność, PL, Ustawienia)
          ========================================= */}
      <div className="flex w-full items-center gap-2 md:hidden">
        {/* Rozszerzająca się kapsuła z nazwą budynku */}
        <div
          role="button"
          tabIndex={0}
          className="pointer-events-auto flex h-12 flex-1 min-w-0 items-center justify-between rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-colors active:bg-zinc-200 dark:active:bg-zinc-800 select-none"
        >
          <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
            {buildingName}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
        </div>

        {/* Przycisk Dostępność (♿) */}
        <button
          type="button"
          title="Tryb bez barier"
          className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 text-zinc-700 dark:text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-transform active:scale-95"
        >
          <Accessibility className="h-5 w-5" />
        </button>

        {/* Przycisk Język (PL) */}
        <button
          type="button"
          title="Zmień język"
          className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 text-xs font-bold text-zinc-800 dark:text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-transform active:scale-95 select-none"
        >
          PL
        </button>

        {/* Przycisk Przełącz motyw / Ustawienia (⚙️ / 🌙) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny"}
          className="pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 text-zinc-700 dark:text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-transform active:scale-95"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-zinc-700" />
          )}
        </button>
      </div>

      {/* =========================================
          WIDOK DESKTOP (>= 768px):
          Logo po lewej, wyśrodkowany budynek,
          akcje po prawej
          ========================================= */}
      <div className="hidden w-full items-center justify-between md:flex">
        {/* Brand / Logo */}
        <div className="pointer-events-auto flex h-12 items-center gap-2.5 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl select-none">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white">
            N
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
            NavigatorPM
          </span>
        </div>

        {/* Building Selector Pill (Środek) */}
        <div
          role="button"
          tabIndex={0}
          className="pointer-events-auto flex h-12 items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 px-5 text-sm font-semibold text-zinc-800 dark:text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80 select-none"
        >
          <Building2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <span>{buildingName}</span>
          <ChevronDown className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </div>

        {/* Quick Action Badges (Prawo) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            title="Tryb bez barier (windy zamiast schodów)"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 text-zinc-700 dark:text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Accessibility className="h-5 w-5" />
          </button>

          <button
            type="button"
            title="Zmień język"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 text-xs font-bold text-zinc-800 dark:text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 select-none"
          >
            PL
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny"}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 text-zinc-700 dark:text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-zinc-700" />
            )}
          </button>

          <button
            type="button"
            title="Ustawienia"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/85 text-zinc-700 dark:text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-2xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
