<template>
  <AuthPanel mode="register" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Регистрация',
  description: 'Создание профиля Core of Life.',
  robots: 'noindex, nofollow',
})
</script>
