<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

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
])
</script>

<template>
  <UHeader>
    <template #title>
      Title
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
  </UHeader>
</template>

<style scoped>

</style>