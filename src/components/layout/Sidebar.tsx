import { NavLink } from 'react-router-dom'
import { Home, History, Target, ImageIcon, FileText, PiggyBank, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../auth/AuthProvider'

const navItems = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/riwayat', label: 'Riwayat', icon: History },
  { to: '/target', label: 'Target', icon: Target },
  { to: '/galeri', label: 'Galeri', icon: ImageIcon },
  { to: '/ekspor', label: 'Ekspor', icon: FileText },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 border-r border-border bg-white flex flex-col h-dvh sticky top-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <PiggyBank size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Tabungan Lia</p>
          <p className="text-xs text-muted-foreground">Personal savings</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150',
                isActive
                  ? 'bg-accent text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* Add transaction CTA */}
        <div className="pt-4">
          <NavLink
            to="/setor"
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/90 text-white'
                  : 'bg-primary text-white hover:bg-primary/90'
              )
            }
          >
            + Setor Tabungan
          </NavLink>
        </div>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
