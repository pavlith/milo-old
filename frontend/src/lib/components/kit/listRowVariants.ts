import { tv } from 'tailwind-variants'

export const listRowVariants = tv({
  base: 'flex w-full cursor-pointer rounded-lg border bg-card text-left transition-colors hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
  variants: {
    density: {
      micro: 'px-3 py-2 gap-2',
      compact: 'px-4 py-3 gap-3',
      standard: 'px-5 py-4 gap-4',
      large: 'px-6 py-5 gap-5',
    },
    selected: {
      true: 'border-primary/50 bg-muted',
    },
  },
  defaultVariants: { density: 'standard' },
})
