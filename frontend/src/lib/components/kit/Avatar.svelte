<script lang="ts">
  import * as Avatar from '$lib/components/ui/avatar'

  interface Props {
    /** Email address used as the color-hash seed. */
    email: string
    colorSeed?: string
    /** Optional display name. If absent, initials derive from email. */
    name?: string
    /** Density preset. */
    density?: 'micro' | 'compact' | 'standard' | 'large'
    /** Override the density-derived pixel size (rare). */
    size?: number
    /** Inline base64-encoded photo bytes. When set with photoMediaType, the
     *  avatar renders as an <img> instead of initials. Falls back to initials
     *  on image load error. */
    photoData?: string
    /** Photo media type (e.g. "image/jpeg"). Required alongside photoData. */
    photoMediaType?: string
  }

  const { email, colorSeed = email, name, density = 'standard', size, photoData, photoMediaType }: Props = $props()

  function colorClass(seed: string): string {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `avatar-${(Math.abs(hash) % 14) + 1}`
  }

  function initials(displayName: string | undefined, fallbackEmail: string): string {
    if (!displayName && !fallbackEmail) return '?'
    const name = displayName || fallbackEmail
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Density → pixel size table. Tuned to match mail UI's density visual weight.
  const DENSITY_SIZE: Record<NonNullable<Props['density']>, number> = {
    micro: 24,
    compact: 28,
    standard: 32,
    large: 40,
  }

  const px = $derived(size ?? DENSITY_SIZE[density])
  const fontPx = $derived(Math.round(px * 0.4))
  const cls = $derived(colorClass(colorSeed))
  const text = $derived(initials(name, email))
</script>

<Avatar.Root class="overflow-hidden" style="width: {px}px; height: {px}px" aria-hidden="true">
  {#if photoData && photoMediaType}
    <Avatar.Image src="data:{photoMediaType};base64,{photoData}" alt="" class="object-cover" />
  {/if}
  <Avatar.Fallback class={cls} style="font-size: {fontPx}px">
    {text}
  </Avatar.Fallback>
</Avatar.Root>
