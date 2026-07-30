<template>
  <ProfilePanel />
</template>

<script setup lang="ts">
import ProfilePanel from '~/components/profile/ProfilePanel.vue'

useSeoMeta({
  title: 'Профиль',
  description: 'Профиль и прогресс пользователя Core of Life.',
  robots: 'noindex, nofollow',
})
</script>
