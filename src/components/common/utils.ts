export function isExtraSmallSize(size: string = ''): size is 'xs' {
  return size === 'xs'
}

export function isSmallSize(size: string = ''): size is 'sm' {
  return size === 'sm'
}

export function isMediumSize(size: string = ''): size is 'md' {
  return size === 'md'
}

export function isLargeSize(size: string = ''): size is 'lg' {
  return size === 'lg'
}
