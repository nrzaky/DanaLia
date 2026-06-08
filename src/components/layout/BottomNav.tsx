import { NavLink } from 'react-router-dom'
import { Home, History, Plus, Target, ImageIcon, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/riwayat', label: 'Riwayat', icon: History },
  { to: '/target', label: 'Target', icon: Target },
  { to: '/galeri', label: 'Galeri', icon: ImageIcon },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      <div className="flex items-center h-14 max-w-lg mx-auto px-2">
        {navItems.slice(0, 2).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-0.5 py-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Center FAB */}
        <div className="flex-none px-3">
          <NavLink
            to="/setor"
            className={({ isActive }) =>
              cn(
                'w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md transition-transform active:scale-95',
                isActive && 'bg-primary/90'
              )
            }
            aria-label="Setor"
          >
            <Plus size={24} className="text-white" strokeWidth={2.5} />
          </NavLink>
        </div>

        {navItems.slice(2).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-0.5 py-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
