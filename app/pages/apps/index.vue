<script setup lang="ts">
import Convert from "ansi-to-html";

definePageMeta({
  middleware: ['authenticated'],
})


const modalOpen: Ref<boolean> = ref(false)
const modalTitle: Ref<string> = ref('Command Output')
const commandOutput: Ref<string | undefined> = ref(undefined)
const commandRunnning: Ref<boolean> = ref(false)
const newAppName: Ref<string> = ref('')

const apps: App[] = ref([])
onMounted(async () => {
  apps.value = await $fetch('/api/dokku/apps/list', {
    query: {
      withState: true,
      withUrls: true,
    }
  })
})


function createModal(provider: string) {
  commandOutput.value = undefined
  newAppName.value = ''
  modalTitle.value = 'Create new app'
  modalOpen.value = true
}

async function createApp() {
  commandOutput.value = ''
  commandRunnning.value = true
  const result: ReadableStream = await $fetch(`/api/dokku/apps/create`, {
    method: 'POST',
    body: {name: newAppName.value},
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
      modalTitle.value = `Created new app`
      $fetch('/api/dokku/apps/list', {
        query: {
          withState: true,
          withUrls: true,
        }
      }).then(res => apps.value = res)
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
    <h2 class="mb-4">Apps</h2>
    <UButton class="mb-4" @click="createModal()">Create app</UButton>

    <UPageGrid>
      <UCard v-for="app in apps" :key="app.name" variant="subtle" @click="navigateTo({ name: 'apps-name', params: { name: app.name } })" class="cursor-pointer">
        <template #header>
          <div class="flex justify-between items-center">
            <h3>{{ app.name }}</h3>
            <template v-if="app.state.deployed">
              <UTooltip :text="app.state.running ? 'Running' : 'Stopped'">
                <div class="rounded-full h-4 w-4 " :class="app.state.running ? 'bg-primary animate-pulse' : 'bg-error'"/>
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
            <UFormField label="App name" :error="newAppName === '' ? 'App name is required' : ''">
              <UInput v-model="newAppName" placeholder="Enter app name"/>
            </UFormField>
            <div class="mt-4 flex justify-end">
              <UButton :disabled="newAppName === ''" color="primary" @click="createApp()">Create</UButton>
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