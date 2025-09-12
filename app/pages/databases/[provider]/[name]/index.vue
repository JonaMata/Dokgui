<script setup lang="ts">
import Convert from 'ansi-to-html'

definePageMeta({
  middleware: ['authenticated'],
})

// const {user, clear: clearSession} = useUserSession()
const appName = useRoute().params.name as string
const app: Ref<Record<string, string | boolean>> = ref({})
const state: Ref<Record<string, string | boolean>> = ref({})
const urls: Ref<string[]> = ref([])
const logs: Ref<string> = ref('')
const modalOpen: Ref<boolean> = ref(false)
const modalTitle: Ref<string> = ref('Command Output')
const commandOutput: Ref<string> = ref('')
const commandRunnning: Ref<boolean> = ref(false)
onMounted(async () => {
  $fetch(`/api/dokku/apps/${appName}/info`).then(res => app.value = res)
  $fetch(`/api/dokku/apps/${appName}/state`).then(res => state.value = res)
  $fetch(`/api/dokku/apps/${appName}/logs`).then(res => {
    const convert = new Convert({
      newline: true
    })
    logs.value = convert.toHtml(res)
  })
  $fetch(`/api/dokku/apps/${appName}/urls`).then(res => urls.value = res)
})

async function runCommand(command: string) {
  if (!['start', 'stop', 'restart', 'rebuild'].includes(command)) return
  switch (command) {
    case 'start':
      modalTitle.value = `Starting ${appName}...`
      break
    case 'stop':
      modalTitle.value = `Stopping ${appName}...`
      break
    case 'restart':
      modalTitle.value = `Restarting ${appName}...`
      break
    case 'rebuild':
      modalTitle.value = `Rebuilding ${appName}...`
      break
  }
  commandOutput.value = ''
  commandRunnning.value = true
  modalOpen.value = true
  const result: ReadableStream = await $fetch(`/api/dokku/apps/${appName}/command`, {
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
  reader.read().then(function pump({done, value}) {
    if (done) {
      commandRunnning.value = false
      switch (command) {
        case 'start':
          modalTitle.value = `${appName} started`
          break
        case 'stop':
          modalTitle.value = `${appName} stopped`
          break
        case 'restart':
          modalTitle.value = `${appName} restarted`
          break
        case 'rebuild':
          modalTitle.value = `${appName} rebuilt`
          break
      }
      $fetch(`/api/dokku/apps/${appName}/state`).then(res => state.value = res)
      $fetch(`/api/dokku/apps/${appName}/logs`).then(res => {
        const convert = new Convert({
          newline: true
        })
        logs.value = convert.toHtml(res)
      })
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
    <div class="flex items-center w-full">
      <h2 class="mb-4">{{ appName }}</h2>
      <UBadge :color="!state['Deployed'] ? 'warning' : state['Running'] ? 'success' : 'error'" class="ms-4">
        {{ !state['Deployed'] ? 'Not deployed' : state['Running'] ? 'Running' : 'Stopped' }}
      </UBadge>
      <UTooltip v-if="app['App locked']" text="App is locked">
        <UIcon class="size-10 text-warning" name="i-pajamas-lock"/>
      </UTooltip>
      <div class="ms-auto flex items-center gap-2">
        <UButton
            :disabled="!state['Deployed'] || state['Running']" color="success" icon="i-pajamas-play"
            @click="runCommand('start')">Start
        </UButton>
        <UButton :disabled="!state['Deployed']" color="warning" icon="i-pajamas-repeat" @click="runCommand('restart')">
          Restart
        </UButton>
        <UButton
            :disabled="!state['Deployed'] || !state['Running']" color="error" icon="i-pajamas-stop"
            @click="runCommand('stop')">Stop
        </UButton>
        <UButton color="secondary" icon="i-pajamas-api" @click="runCommand('rebuild')">Rebuild</UButton>
      </div>
    </div>
    <table>
      <tbody>
      <tr>
        <td class="font-bold pr-4">Created at</td>
        <td>{{ new Date(app['App created at'] * 1000).toLocaleString() }}</td>
      </tr>
      <tr>
        <td class="font-bold pr-4">Deployed from</td>
        <td>{{ app['App deploy source'] }}</td>
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