<script setup lang="ts">

import NavBar from "~/components/layout/NavBar.vue";
import Footer from "~/components/layout/Footer.vue";
</script>

<template>
  <UApp tooltip.delay-duration="200">
    <NavBar/>
    <UMain class="py-4">
      <slot/>
    </UMain>
    <USeparator icon="i-simple-icons-nuxtdotjs" type="dashed" class="h-px"/>
    <Footer/>
  </UApp>
</template>

<style scoped>

</style>