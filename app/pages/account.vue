<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

const {user, clear: clearSession} = useUserSession()

const pubKey = ref('')

async function logout() {
  await clearSession()
  await navigateTo('/login')
}

onMounted(async () => {
  $fetch('api/pubkey').then((res) => {
    pubKey.value = res as string
  })
})

</script>

<template>
  <UContainer>
    <h1>Welcome {{ user.email }}</h1>
    <button @click="logout">Logout</button>
    <h2>Your Public Key:</h2>
    <pre>{{ pubKey }}</pre>

  </UContainer>
</template>
