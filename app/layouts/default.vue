<script setup lang="ts">

import NavBar from "~/components/layout/NavBar.vue";
import Footer from "~/components/layout/Footer.vue";
</script>

<template>
  <UApp>
    <NavBar/>
    <UMain>
      <UContainer>
        <slot/>
      </UContainer>
      <div class="absolute bottom-0 w-full">
        <USeparator icon="i-simple-icons-nuxtdotjs" type="dashed" class="h-px"/>
        <Footer/>
      </div>
    </UMain>
  </UApp>
</template>

<style scoped>

</style>