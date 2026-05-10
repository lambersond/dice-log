import clsx from 'clsx'
import type { SwitchProps } from './types'

const SIZE_CLASSES = {
  sm: 'w-4 h-3 after:w-2 after:h-2 peer-checked:after:translate-x-1.25 p-0.25',
  md: 'w-6 h-4.5 after:w-3 after:h-3 peer-checked:after:translate-x-1.5 p-0.75',
  lg: 'w-9 h-5.5 after:w-4.5 after:h-4.5 peer-checked:after:translate-x-2.75 p-1',
} as const

const LABEL_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
} as const

const TEXT_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
} as const

export function Switch({
  label,
  name = 'switch',
  disabled = false,
  size = 'md',
  labelSize = 'md',
  labelClassName = 'text-text-primary',
  orientation = 'horizontal',
  leftText,
  rightText,
  ...props
}: Readonly<SwitchProps>) {
  const hasSideText = Boolean(leftText || rightText)

  const labelClasses = clsx(
    'relative',
    LABEL_SIZE_CLASSES[labelSize],
    orientation === 'horizontal'
      ? 'flex flex-row justify-between items-center flex-grow'
      : 'flex flex-col items-start text-text-secondary font-bold',
    orientation === 'horizontal' && labelClassName,
  )

  const switchTrackClasses = clsx(
    'flex items-center flex-shrink-0 rounded-full duration-300 ease-in-out cursor-pointer',
    'after:rounded-full after:shadow-md after:duration-300 group-hover:after:translate-x-1',
    SIZE_CLASSES[size],
    'bg-secondary/15 after:bg-secondary/80 peer-checked:bg-primary peer-checked:after:bg-white',
    disabled && 'opacity-50 cursor-not-allowed',
  )

  const sideTextClasses = () =>
    clsx(
      'select-none font-normal',
      TEXT_SIZE_CLASSES[size],
      'text-text-primary',
    )

  return (
    <label className={labelClasses} htmlFor={name}>
      {label}
      <div
        className={clsx(
          'relative flex items-center',
          hasSideText ? 'gap-3' : 'ml-4',
        )}
      >
        {!!leftText && <p className={sideTextClasses()}>{leftText}</p>}

        <input
          id={name}
          name={name}
          disabled={disabled}
          type='checkbox'
          className='sr-only peer cursor-pointer'
          {...props}
        />

        <span className={switchTrackClasses} />

        {!!rightText && <p className={sideTextClasses()}>{rightText}</p>}
      </div>
    </label>
  )
}
