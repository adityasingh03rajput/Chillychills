import React from 'react'
import { Home, Menu, ShoppingCart, List } from 'lucide-react'

type Props = {
  role: string
  activeTab: string
  onTabChange: (tab: string) => void
  cartCount?: number
  onThemeToggle?: () => void
  theme?: 'day' | 'night'
  children: React.ReactNode
}

// Mobile shell: fixed header, content area, and optional bottom navigation for students
export const MobileShell: React.FC<Props> = ({ role, activeTab, onTabChange, cartCount = 0, onThemeToggle, theme = 'day', children }) => {
  const isStudent = role === 'student'
  const headerTitle = 'Chilly Chills'

  return (
    <div className="mobile-shell min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[var(--card-bg)] border-b border-[var(--border-color)] shadow-md"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2">
          <img src="/assets/logo-jBsgdAs_.png" alt={headerTitle} className="h-8 w-auto" />
          <span className="font-semibold text-lg">{headerTitle}</span>
        </div>
        {onThemeToggle && (
          <button aria-label="Toggle Theme" onClick={onThemeToggle} className="p-2 rounded-md hover:bg-[var(--border-color)]">
            {theme === 'day' ? (
              // sun icon to indicate day mode
              <span aria-label="Day mode">🌞</span>
            ) : (
              <span aria-label="Night mode">🌙</span>
            )}
          </button>
        )}
      </header>

      {/* Content */}
      <main className="pt-14 pb-20 min-h-screen">{children}</main>

      {/* Bottom navigation for student role */}
      {isStudent && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card-bg)] border-t border-[var(--border-color)] flex justify-around p-2 shadow-inner" aria-label="Main">
          {[
            { key: 'home', label: 'Home', Icon: Home },
            { key: 'menu', label: 'Menu', Icon: Menu },
            { key: 'cart', label: 'Cart', Icon: ShoppingCart },
            { key: 'orders', label: 'Orders', Icon: List },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md w-full ${activeTab === item.key ? 'bg-[var(--accent-orange)] text-white' : 'text-[var(--text-primary)]'}`}
            >
              <item.Icon size={20} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
