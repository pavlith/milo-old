<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants'

  const sidebarMenuButtonVariants = tv({
    base: 'ring-sidebar-ring hover:bg-surface-hover hover:text-sidebar-foreground active:bg-surface-active active:text-sidebar-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-md p-2 text-left text-sm transition-none group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate',
    variants: {
      variant: {
        default: 'hover:bg-surface-hover hover:text-sidebar-foreground',
        outline: 'bg-background hover:bg-surface-hover hover:text-sidebar-foreground shadow-[0_0_0_1px_var(--color-sidebar-border)] hover:shadow-[0_0_0_1px_var(--color-sidebar-accent)]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  })

  type SidebarMenuButtonVariant = VariantProps<typeof sidebarMenuButtonVariants>['variant']
  type SidebarMenuButtonSize = VariantProps<typeof sidebarMenuButtonVariants>['size']
</script>

<script lang="ts">
  import { mergeProps } from 'bits-ui'
  import * as Tooltip from '$lib/components/ui/tooltip/index'
  import { cn, type WithElementRef, type WithoutChildrenOrChild } from '$lib/utils'
  import type { ComponentProps, Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  let {
    ref = $bindable(null),
    class: className,
    children,
    child,
    variant = 'default',
    size = 'default',
    type = 'button',
    isActive = false,
    tooltipContent,
    tooltipContentProps,
    ...restProps
  }: WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
    isActive?: boolean
    variant?: SidebarMenuButtonVariant
    size?: SidebarMenuButtonSize
    tooltipContent?: Snippet | string
    tooltipContentProps?: WithoutChildrenOrChild<ComponentProps<typeof Tooltip.Content>>
    child?: Snippet<[{ props: Record<string, unknown> }]>
  } = $props()

  const buttonProps = $derived({
    class: cn(sidebarMenuButtonVariants({ variant, size }), className),
    type,
    'data-slot': 'sidebar-menu-button',
    'data-sidebar': 'menu-button',
    'data-size': size,
    'data-active': isActive,
    ...restProps,
  })
</script>

{#snippet Button({ props }: { props?: Record<string, unknown> })}
  {@const mergedProps = mergeProps(buttonProps, props)}
  {#if child}
    {@render child({ props: mergedProps })}
  {:else}
    <button bind:this={ref} {...mergedProps}>
      {@render children?.()}
    </button>
  {/if}
{/snippet}

{#if !tooltipContent}
  {@render Button({})}
{:else}
  <Tooltip.Root>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        {@render Button({ props })}
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Content
      side="right"
      align="center"
      sideOffset={6}
      {...tooltipContentProps}
    >
      {#if typeof tooltipContent === 'string'}
        {tooltipContent}
      {:else if tooltipContent}
        {@render tooltipContent()}
      {/if}
    </Tooltip.Content>
  </Tooltip.Root>
{/if}
