import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/lib/theme-context'

const Toaster = ({ ...props }) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }}
      {...props}
    />
  )
}

export { Toaster }
