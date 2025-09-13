<script setup lang="ts">
import Convert from 'ansi-to-html'
import {APP_COMMANDS, type AppInfo, type AppState} from "#shared/dokku/apps";

definePageMeta({
  middleware: ['authenticated'],
})

const confirmModal = useConfirmModal()

const name = useRoute().params.name as string
const info: Ref<AppInfo> = ref({
  createdAt: new Date(),
  deploySource: '',
  locked: false
})
const state: Ref<AppState> = ref({
  deployed: false,
  running: false
})
const urls: Ref<string[]> = ref([])
const logs: Ref<string> = ref('')
const modalOpen: Ref<boolean> = ref(false)
const modalTitle: Ref<string> = ref('Command Output')
const commandOutput: Ref<string> = ref('')
const commandRunnning: Ref<boolean> = ref(false)

function loadData() {
  $fetch(`/api/dokku/apps/${name}/info`).then(res => info.value = {
    ...res,
    createdAt: new Date(res.createdAt)
  })
  $fetch(`/api/dokku/apps/${name}/state`).then(res => state.value = res)
  $fetch(`/api/dokku/apps/${name}/logs`).then(res => {
    const convert = new Convert({
      newline: true
    })
    logs.value = convert.toHtml(res as string)
  })
  $fetch(`/api/dokku/apps/${name}/urls`).then(res => urls.value = res)
}

onMounted(async () => {
  loadData()
})

async function runCommand(command: string) {
  if (!APP_COMMANDS.includes(command)) return
  switch (command) {
    case 'start':
      modalTitle.value = `Starting ${name}...`
      break
    case 'stop':
      modalTitle.value = `Stopping ${name}...`
      break
    case 'restart':
      modalTitle.value = `Restarting ${name}...`
      break
    case 'rebuild':
      modalTitle.value = `Rebuilding ${name}...`
      break
  }
  commandOutput.value = ''
  commandRunnning.value = true
  modalOpen.value = true
  const result: ReadableStream = await $fetch(`/api/dokku/apps/${name}/command`, {
    method: 'POST',
    body: {command},
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
      switch (command) {
        case 'start':
          modalTitle.value = `${name} started`
          break
        case 'stop':
          modalTitle.value = `${name} stopped`
          break
        case 'restart':
          modalTitle.value = `${name} restarted`
          break
        case 'rebuild':
          modalTitle.value = `${name} rebuilt`
          break
      }
      loadData()
      return;
    }
    output += decoder.decode(value)
    commandOutput.value = convert.toHtml(output);
    return reader.read().then(pump);
  })
}

function destroyApp() {
  const loading = ref(false)
  const error = ref('')
  confirmModal.open({
    title: `Destroy ${name}?`,
    body: 'Are you sure you want to destroy this app? This action cannot be undone.',
    confirmText: `Destroy ${name}?`,
    confirmColor: 'error',
    loading: loading,
    error: error,
    confirm: () => {
      loading.value = true
      $fetch(`/api/dokku/apps/${name}/destroy`, {
        method: 'POST'
      }).then(() => {
        loading.value = false
        confirmModal.close(true)
        navigateTo({name: 'apps'})
      }).catch(err => {
        loading.value = false
        error.value = `Failed to destroy ${name}: ${err.message}`
      })
    }
  })
}
</script>

<template>
  <UContainer class="prose">
    <div class="flex items-center w-full">
      <h2 class="mb-4">{{ name }}</h2>
      <UBadge :color="!state.deployed ? 'warning' : state.running ? 'success' : 'error'" class="ms-4">
        {{ !state.deployed ? 'Not deployed' : state.running ? 'Running' : 'Stopped' }}
      </UBadge>
      <UTooltip v-if="info.locked" text="App is locked">
        <UIcon class="size-10 text-warning" name="i-pajamas-lock"/>
      </UTooltip>
      <div class="ms-auto flex items-center gap-2">
        <UButton
            :disabled="!state.reployed || state.running" color="success" icon="i-pajamas-play"
            @click="runCommand('start')">Start
        </UButton>
        <UButton :disabled="!state.deployed" color="warning" icon="i-pajamas-repeat" @click="runCommand('restart')">
          Restart
        </UButton>
        <UButton
            :disabled="!state.deployed || !state.running" color="error" icon="i-pajamas-stop"
            @click="runCommand('stop')">Stop
        </UButton>
        <UButton color="secondary" icon="i-pajamas-api" @click="runCommand('rebuild')">Rebuild</UButton>
      </div>
    </div>
    <table>
      <tbody>
      <tr>
        <td class="font-bold pr-4">Created at</td>
        <td>{{ new Date(info.createdAt).toLocaleString() }}</td>
      </tr>
      <tr>
        <td class="font-bold pr-4">Deployed from</td>
        <td>{{ info.deploySource }}</td>
      </tr>
      <tr>
        <td class="font-bold align-top pr-4">Urls</td>
        <td>
          <ul>
            <li v-for="url in urls" :key="url"><a :href="url" target="_blank">{{ url }}</a></li>
          </ul>
        </td>
      </tr>
      </tbody>
    </table>

    <UButton
        class="mt-4"
        color="error"
        icon="i-pajamas-remove"
        @click="destroyApp()">
      Destroy
    </UButton>
    <USeparator class="my-2" icon="i-pajamas-log" type="dashed"/>
    <div class="font-mono border border-gray-500 rounded-sm p-2 bg-gray-100 dark:bg-gray-800" v-html="logs"/>
    <UModal v-model:open="modalOpen" :dismissible="!commandRunnning" :scrollable="true">
      <template #header>
        <h3 class="text-lg font-bold">{{ modalTitle }}</h3>
      </template>
      <template #body>
        <div
            class="font-mono border border-gray-500 rounded-sm p-2 bg-gray-100 dark:bg-gray-800 h-full overflow-auto"
            v-html="commandOutput"/>
      </template>
      <template #footer>
        <div class="w-full flex justify-between">
          <UButton :disabled="commandRunnning" color="primary" @click="modalOpen = false">Close</UButton>
          <UBadge :color="commandRunnning ? 'warning' : 'success'">
            {{ commandRunnning ? 'Running...' : 'Finished' }}
          </UBadge>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>

<style scoped>

</style>