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
  tokens.value = await $fetch('/api/user/token/list')
})
</script>

<template>
  <UContainer class="prose relative">
    <h2 class="mb-4">Tokens</h2>
    <table class="table-auto border-separate border-spacing-y-2 border-spacing-x-4">
      <thead class="font-bold">
      <tr>
        <td>Name</td>
        <td>Token</td>
        <td>Actions</td>
      </tr>
      </thead>
      <tbody>
      <tr v-for="token in tokens" :key="token.name">
        <td>{{ token.name }}</td>
        <td>{{ token.token }}</td>
        <td>
          <UButton @click="deleteToken(token.name)">Delete</UButton>
        </td>
      </tr>
      </tbody>
    </table>
    <h3>New token</h3>
    <form @submit.prevent="createToken">
      <UInput v-model="formData.name" type="text" placeholder="Name"/>
      <UButton class="ms-2" type="submit">Create token</UButton>
    </form>
  </UContainer>
</template>

<style scoped>

</style>