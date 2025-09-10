<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})
const tokens: Ref<Token[]> = ref([])

const formData = reactive({
  name: '',
})
async function createToken() {
  $fetch('/api/user/token/create', {
    method: 'POST',
    body: formData
  })
      .then((data: Token) => {
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
  tokens.value = await useFetch('/api/user/token/list')
})
</script>

<template>
  <UContainer class="prose">
    <h2 class="mt-4 mb-4">Tokens</h2>
    <ul>
      <li class="mb-2" v-for="token in tokens" :key="token.name">
        {{ token.name }} : {{ token.token }}
        <UButton @click="deleteToken(token.name)">Delete</UButton>
      </li>
    </ul>
    <form @submit.prevent="createToken">
      <UInput v-model="formData.name" type="text" placeholder="Name"/>
      <UButton class="ms-2" type="submit">Create token</UButton>
    </form>
  </UContainer>
</template>

<style scoped>

</style>