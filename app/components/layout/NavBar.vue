<script setup lang="ts">
import type {NavigationMenuItem} from '@nuxt/ui'
import {UDashboardNavbar, UHeader} from "#components";

const props = defineProps<{
  dashboard?: boolean
}>()

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    to: '/',
    active: route.path === '/'
  },
  {
    label: 'Apps',
    to: '/apps',
    active: route.path.startsWith('/apps')
  },
  {
    label: 'Databases',
    to: '/databases',
    active: route.path.startsWith('/databases')
  },
  {
    label: 'Tokens',
    to: '/tokens',
    active: route.path.startsWith('/tokens')
  }
])
</script>

<template>
  <component :is="props.dashboard ? UDashboardNavbar : UHeader">
        <template #title>
          Dokgui
        </template>

    <UNavigationMenu :items="items"/>
    <template #right>
      <UColorModeButton/>

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/JonaMata"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </component>
</template>

<style scoped>

</style>