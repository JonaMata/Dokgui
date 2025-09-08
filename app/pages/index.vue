<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

const {user, clear: clearSession} = useUserSession()

const tokens = ref([])
const apps = ref("")

const formData = reactive({
  name: '',
})

async function logout() {
  await clearSession()
  await navigateTo('/login')
}

async function createToken() {
  $fetch('/api/user/token/create', {
    method: 'POST',
    body: formData
  })
      .then(async (data) => {
        // Refresh the session on client-side and redirect to the home page
        tokens.value.push(data)
      })
      .catch(() => alert('Error creating token'))
}

async function deleteToken(name: string) {
  $fetch('/api/user/token/delete', {
    method: 'POST',
    body: {name}
  })
      .then(async () => {
        // Refresh the session on client-side and redirect to the home page
        tokens.value = tokens.value.filter(t => t.name !== name)
      })
      .catch(() => alert('Error deleting token'))
}

onMounted(async () => {
  tokens.value = await $fetch('/api/user/token/list')
  apps.value = await $fetch('/api/dokku/apps/list')
})
</script>

<template>
  <div>
    <h1>Welcome {{ user.email }}</h1>
    <button @click="logout">Logout</button>
    <hr>
    <h1>Tokens</h1>
    <ul>
      <li v-for="token in tokens" :key="token.name">
        {{ token.name }} : {{ token.token }}
        <button @click="deleteToken(token.name)">Delete</button>
      </li>
    </ul>
    <form @submit.prevent="createToken">
      <input v-model="formData.name" type="text" placeholder="Name"/>
    </form>
    <hr>
    <h1>Apps</h1>
    <UPageGrid>
      <UCard variant="subtle" v-for="app in apps" :key="app.name">
        <template #header>
          <h3>{{ app.name }}</h3>
        </template>
        <h6>Deployed: {{app.deployed}}</h6>
        <h6>Running: {{app.running}}</h6>
        <ul>
          <li v-for="url in app.urls" :key="url"><a :href="url">{{ url }}</a></li>
        </ul>
      </UCard>
    </UPageGrid>
  </div>
</template>
