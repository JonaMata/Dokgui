<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

// const {user, clear: clearSession} = useUserSession()

const providers: Ref<Record<string, Record<string, string | string[]>[]>> = ref({})
onMounted(async () => {
  providers.value = await $fetch('/api/dokku/databases/list')
})
</script>

<template>
  <UContainer class="prose">
    <h2 class="mb-4">Databases</h2>
    <div v-for="(dbs, provider) in providers" :key="provider" class="mt-4">
      <div class="mb-4 flex flex-row items-center gap-2">
        <h3>{{ provider }}</h3>
        <UButton>Create database</UButton>
      </div>
      <UPageGrid v-if="dbs.length > 0">
        <UCard v-for="db in dbs" :key="db" variant="subtle" @click="navigateTo(`/databases/${provider}/${db}`)">
          <template #header>
            <div class="flex justify-between items-center">
              <h3>{{ db.name }}</h3>
              <div class="flex items-center gap-2">
                <template v-if="db['Links'].length === 0">
                  <UTooltip text="Not in use">
                    <UIcon name="i-pajamas-link" class="text-warning"/>
                  </UTooltip>
                </template>
                <template v-else>
                  <UTooltip text="In use by {{ db['Links'].join(', ') }}">
                    <UIcon name="i-pajamas-link" class="text-success"/>
                  </UTooltip>
                </template>
                <UTooltip :text="db['Status'] === 'running' ? 'Running' : 'Stopped'">
                  <div class="rounded-full h-4 w-4 " :class="db['Status'] === 'running' ? 'bg-primary animate-pulse' : 'bg-error'"/>
                </UTooltip>
              </div>
            </div>
          </template>
          <ul v-if="db['Links'].length > 0">
            <li v-for="app in db.links" :key="app"><a :href="`/apps/${app}`" target="_blank">{{ app }}</a></li>
          </ul>
          <span v-else>No apps linked to DB</span>
        </UCard>
      </UPageGrid>
      <h4 v-else>No databases</h4>
      <USeparator class="mt-4" />
    </div>

  </UContainer>
</template>

<style scoped>

</style>