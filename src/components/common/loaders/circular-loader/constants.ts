import type { CircularLoaderProps } from './types'

export const SIZE_CLASSES: Record<
  NonNullable<CircularLoaderProps['size']>,
  string
> = {
  sm: 'h-6 w-6 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
}
