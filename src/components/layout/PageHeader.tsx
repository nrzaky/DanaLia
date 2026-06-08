import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  className?: string
}

export default function PageHeader({ title, subtitle, right, className }: PageHeaderProps) {
  return (
    <div className={cn('px-4 pt-6 pb-4 flex items-start justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {right && <div className="ml-4 mt-1">{right}</div>}
    </div>
  )
}
