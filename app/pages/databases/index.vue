<script setup lang="ts">
import Convert from "ansi-to-html";
import type {Database} from "#shared/dokku/databases";

definePageMeta({
  middleware: ['authenticated'],
})

const modalOpen: Ref<boolean> = ref(false)
const modalTitle: Ref<string> = ref('Command Output')
const commandOutput: Ref<string | undefined> = ref(undefined)
const commandRunnning: Ref<boolean> = ref(false)
const newDbName: Ref<string> = ref('')
const newDbProvider: Ref<string> = ref('')

const providers: Ref<Record<string, Database[]>> = ref({})
onMounted(async () => {
  providers.value = await $fetch('/api/dokku/databases/list')
})

function createModal(provider: string) {
  commandOutput.value = undefined
  newDbProvider.value = provider
  newDbName.value = ''
  modalTitle.value = `Create new ${provider} database`
  modalOpen.value = true
}

async function createDb() {
  commandOutput.value = ''
  commandRunnning.value = true
  const result: ReadableStream = await $fetch(`/api/dokku/databases/${newDbProvider.value}/create`, {
    method: 'POST',
    body: {name: newDbName.value},
    responseType: 'stream'
  })
  const reader = result.getReader();
  const decoder = new TextDecoder('utf-8');
  const convert = new Convert({
    newline: true
  })

  let output: string = ''
  reader.read().then(function pump({done, value}): Promise<void> | void {
    if (done) {
      commandRunnning.value = false
      modalTitle.value = `Created new ${newDbProvider.value} database`
      $fetch(`/api/dokku/databases/list`).then(res => providers.value = res)
      return;
    }
    output += decoder.decode(value)
    commandOutput.value = convert.toHtml(output);
    return reader.read().then(pump);
  })
}
</script>

<template>
  <UContainer class="prose">
    <h2 class="mb-4">Databases</h2>
    <div v-for="(dbs, provider) in providers" :key="provider" class="mt-4">
      <div class="mb-4 flex flex-row items-center gap-2">
        <h3>{{ provider }}</h3>
        <UButton @click="createModal(provider)">Create database</UButton>
      </div>
      <UPageGrid v-if="dbs.length > 0">
        <UCard
            v-for="db in dbs" :key="db" variant="subtle" class="cursor-pointer"
            @click="navigateTo({ name: 'databases-provider-name', params: { provider: provider, name: db.name } })">
          <template #header>
            <div class="flex justify-between items-center">
              <h3>{{ db.name }}</h3>
              <div class="flex items-center gap-2">
                <template v-if="db.apps.length === 0">
                  <UTooltip text="Not in use">
                    <UIcon name="i-pajamas-link" class="text-warning"/>
                  </UTooltip>
                </template>
                <template v-else>
                  <UTooltip :text="`In use by ${ db.apps.join(', ') }`">
                    <UIcon name="i-pajamas-link" class="text-success"/>
                  </UTooltip>
                </template>
                <UTooltip :text="db.status === 'running' ? 'Running' : 'Stopped'">
                  <div
                      class="rounded-full h-4 w-4 "
                      :class="db.status === 'running' ? 'bg-primary animate-pulse' : 'bg-error'"/>
                </UTooltip>
              </div>
            </div>
          </template>
          <template v-if="db.apps.length > 0">
            Linked apps:
            <ul>
              <li v-for="app in db.apps" :key="app">
                <NuxtLink :to="{ name: 'apps-name', params: { name: app }}">{{ app }}</NuxtLink>
              </li>
            </ul>
          </template>
          <span v-else>No apps linked to DB</span>
        </UCard>
      </UPageGrid>
      <h4 v-else>No databases</h4>
      <USeparator class="mt-4"/>
    </div>
    <UModal v-model:open="modalOpen" :dismissible="!commandRunnning" :scrollable="true">
      <template #header>
        <h3 class="text-lg font-bold">{{ modalTitle }}</h3>
      </template>
      <template #body>
        <div
            v-if="commandOutput !== undefined"
            class="font-mono border border-gray-500 rounded-sm p-2 bg-gray-100 dark:bg-gray-800 h-full overflow-auto"
            v-html="commandOutput"/>
        <template v-else>
          <UForm>
            <UFormField label="Database Name" :error="newDbName === '' ? 'Database name is required' : ''">
              <UInput v-model="newDbName" placeholder="Enter database name"/>
            </UFormField>
            <div class="mt-4 flex justify-end">
              <UButton :disabled="newDbName === ''" color="primary" @click="createDb()">Create</UButton>
            </div>
          </UForm>
        </template>
      </template>
      <template #footer>
        <div class="w-full flex justify-between">
          <UButton :disabled="commandRunnning" color="primary" @click="modalOpen = false">Close</UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>

<style scoped>

</style>