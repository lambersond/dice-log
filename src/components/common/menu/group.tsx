import { Options } from './options'
import type { GroupOption } from './types'

export function Group({
  label,
  icon,
  options,
  showHeader,
  emptyText = 'No options available',
}: Readonly<GroupOption>) {
  return (
    <div className='text-text-secondary hover:text-text-primary text-md'>
      <div
        key={label}
        className={`bg-black/4 py-1 p-2 text-text-secondary font-semibold tracking-tight flex items-center justify-between ${showHeader ? 'block' : 'hidden'}`}
      >
        {label}
        {icon}
      </div>
      {options.length === 0 && (
        <p className='p-2 pl-4 text-text-secondary italic'>{emptyText}</p>
      )}
      <Options options={options} hideBorder indent />
    </div>
  )
}
