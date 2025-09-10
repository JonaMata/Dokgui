<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})

const {user, clear: clearSession} = useUserSession()


async function logout() {
  await clearSession()
  await navigateTo('/login')
}

</script>

<template>
  <UContainer>
    <h1>Welcome {{ user.email }}</h1>
    <button @click="logout">Logout</button>

  </UContainer>
</template>
