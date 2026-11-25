<script lang="ts">
  import { _ } from '$lib/i18n'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { Separator } from '$lib/components/ui/separator'
  import RailButton from './RailButton.svelte'
  import { getRailTabs } from '$lib/stores/extensionRegistry.svelte'
  import { accountStore } from '$lib/stores/accounts.svelte'
  import { contactSourcesStore } from '$lib/stores/contactSources.svelte'
  import { getActiveExtension, setActiveExtension } from '$lib/stores/uiState.svelte'

  const { onSettings, onSync }: { onSettings: () => void; onSync: () => void } = $props()
  const active = $derived(getActiveExtension())
  const tabs = $derived(getRailTabs())
</script>

<Sidebar.Root collapsible="none" class="w-(--sidebar-width-icon) shrink-0 border-r border-sidebar-border">
  <nav data-extension-rail class="flex min-h-0 flex-1 flex-col" aria-label={$_('settings.activeExtension')}>
    <Sidebar.Content>
      <Sidebar.Group class="p-1.5">
        <Sidebar.GroupContent>
          <Sidebar.Menu class="gap-1.5">
            <RailButton
              icon="mdi:email-outline"
              label={$_('settings.mail')}
              active={active === 'mail'}
              onclick={() => setActiveExtension('mail')}
            />
            {#each tabs as tab (tab.extensionId)}
              <RailButton
                icon={tab.icon || 'mdi:puzzle'}
                label={$_(`${tab.extensionId}.manifest.name`, { default: tab.label })}
                active={active === tab.extensionId}
                onclick={() => setActiveExtension(tab.extensionId)}
              />
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer class="p-1.5">
      <Separator />
      <Sidebar.Menu class="gap-1.5">
        <RailButton
          icon="mdi:sync"
          spinning={accountStore.isAnySyncing}
          label={$_(accountStore.isAnySyncing ? 'sidebar.clickToCancel' : 'sidebar.syncAllAccounts')}
          disabled={accountStore.accounts.length === 0}
          onclick={onSync}
        />
        <RailButton icon="mdi:cog" label={$_('sidebar.settings')} attention={contactSourcesStore.hasErrors} onclick={onSettings} />
      </Sidebar.Menu>
    </Sidebar.Footer>
  </nav>
</Sidebar.Root>
