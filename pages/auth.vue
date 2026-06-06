<template>
  <AuthPanel mode="login" />
</template>

<script setup lang="ts">
import AuthPanel from '~/components/auth/AuthPanel.vue'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Вход',
  description: 'Вход в личное пространство Core of Life.',
  robots: 'noindex, nofollow',
})
</script>
