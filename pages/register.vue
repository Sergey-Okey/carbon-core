<template>
  <AuthPanel mode="register" />
</template>

<script setup lang="ts">
import AuthPanel from '~/components/auth/AuthPanel.vue'

definePageMeta({
  layout: 'auth',
})
</script>
