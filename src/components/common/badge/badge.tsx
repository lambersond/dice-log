export function Badge({ text }: Readonly<{ text: string }>) {
  return (
    <div className='bg-stone-200 text-text-secondary rounded-md px-2 py-1 inline-flex items-center gap-1'>
      <p className='text-xs font-medium'>{text}</p>
    </div>
  )
}
