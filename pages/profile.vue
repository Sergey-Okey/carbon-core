<template>
  <div class="profile-page">
    <ProfilePanel />
  </div>
</template>

<script setup lang="ts">
import ProfilePanel from '~/components/profile/ProfilePanel.vue'

useSeoMeta({
  title: 'Профиль',
  robots: 'noindex, nofollow',
})
</script>

<style scoped lang="scss">
.profile-page {
  width: 100%;
  max-width: 100%;
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;

  @include desktop {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
