export type DropdownOption<S = string, T = string> = {
  id: S
  label: React.ReactNode
  searchText?: string
  value?: T
}

export type DropdownProps<S = string, T = string | number> = {
  options: DropdownOption<S, T>[]
  defaultSelectedId?: S
  selected?: DropdownOption<S, T>
  onSelect: (option: DropdownOption<S, T>) => void
  label?: string
  name?: string
  required?: boolean
  defaultEmpty?: boolean
  placeholder?: string
  width?: string
  searchable?: boolean
  searchPlaceholder?: string
  size?: 'sm' | 'md' | 'lg'
  multiselection?: boolean
  clearable?: boolean
  clearAfterSelect?: boolean
  error?: string
  hint?: React.ReactNode
  hideError?: boolean
}
