import type { FormHTMLAttributes, ReactNode } from 'react'

export type Form = Omit<FormHTMLAttributes<HTMLFormElement>, 'className'> & {
  children: ReactNode
}
