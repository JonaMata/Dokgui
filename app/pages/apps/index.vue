<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

// const {user, clear: clearSession} = useUserSession()

const apps = ref([])
onMounted(async () => {
  apps.value = await $fetch('/api/dokku/apps/list')
})
</script>

<template>
  <UContainer class="prose">
    <h2 class="mb-4">Apps</h2>
    <UPageGrid>
      <UCard @click="navigateTo(`/apps/${app.name}`)" variant="subtle" v-for="app in apps" :key="app.name">
        <template #header>
          <div class="flex justify-between items-center">
            <h3>{{ app.name }}</h3>
            <template v-if="app.deployed">
              <UTooltip :text="app.running ? 'Running' : 'Stopped'">
                <div class="rounded-full h-4 w-4 " :class="app.running ? 'bg-primary animate-pulse' : 'bg-error'"/>
              </UTooltip>
            </template>
            <template v-else>
              <UTooltip text="App has not been deployed yet">
                <UIcon name="i-pajamas-warning-solid" class="text-warning"/>
              </UTooltip>
            </template>
          </div>
        </template>
        <ul>
          <li v-for="url in app.urls" :key="url"><a :href="url" target="_blank">{{ url }}</a></li>
        </ul>
      </UCard>
    </UPageGrid>
  </UContainer>
</template>

<style scoped>

</style>