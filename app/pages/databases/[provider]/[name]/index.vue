<script setup lang="ts">
import Convert from 'ansi-to-html'

definePageMeta({
  middleware: ['authenticated'],
})

const confirmModal = useConfirmModal()

// const {user, clear: clearSession} = useUserSession()
const {name, provider} = useRoute().params
const titleName = `${provider} database ${name}`
const db: Ref<Database> = ref({})
const logs: Ref<string> = ref('')
const modalOpen: Ref<boolean> = ref(false)
const modalTitle: Ref<string> = ref('Command Output')
const commandOutput: Ref<string> = ref('')
const commandRunnning: Ref<boolean> = ref(false)
onMounted(async () => {
  $fetch(`/api/dokku/databases/${provider}/${name}/info`).then(res => db.value = res)
  $fetch(`/api/dokku/databases/${provider}/${name}/logs`).then(res => {
    const convert = new Convert({
      newline: true
    })
    logs.value = convert.toHtml(res)
  })
})

async function runCommand(command: string) {
  if (!['start', 'stop', 'restart'].includes(command)) return
  switch (command) {
    case 'start':
      modalTitle.value = `Starting ${titleName}...`
      break
    case 'stop':
      modalTitle.value = `Stopping ${titleName}...`
      break
    case 'restart':
      modalTitle.value = `Restarting ${titleName}...`
      break
  }
  commandOutput.value = ''
  commandRunnning.value = true
  modalOpen.value = true
  const result: ReadableStream = await $fetch(`/api/dokku/databases/${provider}/${name}/command`, {
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
          modalTitle.value = `${titleName} started`
          break
        case 'stop':
          modalTitle.value = `${titleName} stopped`
          break
        case 'restart':
          modalTitle.value = `${titleName} restarted`
          break
      }
      $fetch(`/api/dokku/databases/${provider}/${name}/info`).then(res => db.value = res)
      $fetch(`/api/dokku/databases/${provider}/${name}/logs`).then(res => {
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

function destroyDb() {
  const loading = ref(false)
  const error = ref('')
  confirmModal.open({
    title: `Destroy ${titleName}?`,
    body: ((db.value.apps.length > 0)
        ? `This database is linked to ${db.value.apps.length} app(s). You need to unlink this database from all apps before you can destroy it.`
        : `Are you sure you want to destroy this database? This action cannot be undone.`),
    confirmText: `Destroy ${titleName}?`,
    confirmColor: 'error',
    disabled: (db.value.apps.length > 0),
    loading: loading,
    error: error,
    confirm: () => {
      loading.value = true
      $fetch(`/api/dokku/databases/${provider}/${name}/destroy`, {
        method: 'POST'
      }).then(res => {
        loading.value = false
        confirmModal.close(true)
        navigateTo('/databases')
      }).catch(err => {
        loading.value = false
        error.value = `Failed to destroy ${titleName}: ${err.message}`
      })
    }
  })
}
</script>

<template>
  <UContainer class="prose">
    <div class="flex items-center w-full">
      <h2 class="mb-4">{{ name }}</h2>
      <UBadge :color="db.status === 'running' ? 'success' : 'error'" class="ms-4">
        {{ db.status === 'running' ? 'Running' : 'Stopped' }}
      </UBadge>
      <div class="ms-auto flex items-center gap-2">
        <UButton
            :disabled="db.status === 'running'" color="success" icon="i-pajamas-play"
            @click="runCommand('start')">Start
        </UButton>
        <UButton :disabled="db.status !== 'running'" color="warning" icon="i-pajamas-repeat"
                 @click="runCommand('restart')">
          Restart
        </UButton>
        <UButton
            :disabled="db.status !== 'running'" color="error" icon="i-pajamas-stop"
            @click="runCommand('stop')">Stop
        </UButton>
      </div>
    </div>
    <table>
      <tbody>
      <tr>
        <td class="font-bold pr-4">Version</td>
        <td>{{ db.version }}</td>
      </tr>
      <tr>
        <td class="font-bold align-top pr-4">Linked apps</td>
        <td>
          <ul>
            <li v-for="app in db.apps" :key="app"><a :href="`/apps/${app}`" target="_blank">{{ app }}</a></li>
          </ul>
        </td>
      </tr>
      </tbody>
    </table>

    <UButton
        class="mt-4"
        color="error"
        icon="i-pajamas-remove"
        @click="destroyDb()">
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