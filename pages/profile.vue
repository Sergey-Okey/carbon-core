<template>
  <div class="profile-page">
    <ProfilePanel />
  </div>
</template>

<script setup lang="ts">
import ProfilePanel from '~/components/profile/ProfilePanel.vue'
</script>

<style scoped lang="scss">
.profile-page {
  padding-bottom: 80px;

  @include desktop {
    padding-bottom: 0;
  }
}
</style>
