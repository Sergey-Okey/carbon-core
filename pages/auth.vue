<template>
  <AuthPanel mode="login" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Вход',
  description: 'Вход в личное пространство Core of Life.',
  robots: 'noindex, nofollow',
})
</script>
