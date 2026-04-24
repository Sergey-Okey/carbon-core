<template>
  <AuthPanel mode="login" />
</template>

<script setup lang="ts">
import AuthPanel from '~/components/auth/AuthPanel.vue'

definePageMeta({
  layout: 'auth',
})
</script>
