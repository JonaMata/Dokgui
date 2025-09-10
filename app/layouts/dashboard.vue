<script setup lang="ts">

import NavBar from "~/components/layout/NavBar.vue";
import Footer from "~/components/layout/Footer.vue";
</script>

<template>
  <UApp>
    <UDashboardGroup>
      <UDashboardSidebar>
        <slot name="sidebar" />
      </UDashboardSidebar>
      <UDashboardPanel>
        <template #header>
          <NavBar dashboard/>
        </template>
        <template #footer>
          <Footer />
        </template>
        <template #body>
          <slot />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>

<style scoped>

</style>