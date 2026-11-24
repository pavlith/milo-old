<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants'
  import { cn, type WithElementRef } from '$lib/utils'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  export const buttonVariants = tv({
    base: 'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:ring-1 hover:ring-destructive',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  })

  export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
  export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

  type Props = WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
  }
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    variant,
    size,
    type = 'button',
    class: className,
    children,
    ...restProps
  }: Props = $props()
</script>

<button
  bind:this={ref}
  {type}
  data-slot="button"
  class={cn(buttonVariants({ variant, size }), className)}
  {...restProps}
>
  {@render children?.()}
</button>
