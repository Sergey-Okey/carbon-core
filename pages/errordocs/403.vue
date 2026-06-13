<template>
  <ErrorDocPage
    :code="403"
    eyebrow="Доступ ограничен"
    title="Эта страница пока не для текущего профиля"
    description="У текущего профиля нет доступа к этому разделу или действию."
    joke="Охранник вежливый, но сегодня без компромиссов."
    primary-label="На главную"
    primary-action="home"
  />
</template>

<script setup lang="ts">
import ErrorDocPage from '~/components/error/ErrorDocPage.vue'
</script>
