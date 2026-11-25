<script lang="ts">
  import Icon from '@iconify/svelte'
  import { Button } from '$lib/components/ui/button'
  import logo from '../../../assets/images/milo.svg'
  import { _ } from '$lib/i18n'
  import { WindowMinimise, WindowToggleMaximise } from '$lib/desktop'
  import { QuitApp } from '$bindings/github.com/pavlith/milo/app/app'

  interface Props {
    title?: string
    onClose?: () => void
  }

  let { title, onClose }: Props = $props()

  let isMaximized = $state(false)

  async function minimize() {
    await WindowMinimise()
  }

  async function toggleMaximize() {
    await WindowToggleMaximise()
    isMaximized = !isMaximized
  }

  function close() {
    if (onClose) {
      onClose()
    } else {
      // For windows without custom onClose (e.g., composer), just quit directly
      QuitApp()
    }
  }
</script>

<header class="flex h-9 shrink-0 select-none items-center justify-between border-b bg-surface">
  <div class="flex h-full min-w-0 flex-1 items-center gap-2 px-3" style="--wails-draggable: drag">
    <img src={logo} alt="" class="size-5" />
    <span class="truncate text-sm font-semibold">{title ?? 'milo'}</span>
  </div>

  <div class="flex h-full items-center gap-0.5 px-1" role="group" aria-label={$_('aria.windowControls')}>
    <Button variant="ghost" size="icon-sm" class="size-7" onclick={minimize}
      title={$_('window.minimize')} aria-label={$_('aria.minimizeWindow')}>
      <Icon icon="lucide:minus" />
    </Button>
    <Button variant="ghost" size="icon-sm" class="size-7" onclick={toggleMaximize}
      title={isMaximized ? $_('window.restore') : $_('window.maximize')}
      aria-label={isMaximized ? $_('aria.restoreWindow') : $_('aria.maximizeWindow')}>
      <Icon icon={isMaximized ? 'lucide:copy' : 'lucide:square'} />
    </Button>
    <Button variant="ghost" size="icon-sm" class="size-7 hover:bg-error-surface hover:text-error"
      onclick={close} title={$_('window.close')} aria-label={$_('aria.closeWindow')}>
      <Icon icon="lucide:x" />
    </Button>
  </div>
</header>
