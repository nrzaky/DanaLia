import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
          <Icon size={24} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs mb-3">{description}</p>
      )}
      {action}
    </div>
  )
}
