export type IconButtonProps = {
  icon: React.ElementType
  actionIcon?: React.ElementType
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  tooltip?: string
  text?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  intent?:
    | 'primary'
    | 'normal'
    | 'warning'
    | 'danger'
    | 'success'
    | 'info'
    | 'custom'
    | 'text-primary'
    | 'text-secondary'
  border?: boolean
  className?: string
  dataTestId?: string
  'aria-label'?: string
}
