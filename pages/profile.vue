<template>
  <ProfilePanel />
</template>

<script setup lang="ts">
import ProfilePanel from '~/components/profile/ProfilePanel.vue'

useSeoMeta({
  title: 'Профиль',
  robots: 'noindex, nofollow',
})
</script>
