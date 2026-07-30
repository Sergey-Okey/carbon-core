<template>
  <ErrorDocPage
    :code="401"
    eyebrow="Нужен вход"
    title="Сюда пускают только после знакомства"
    description="Чтобы открыть эту часть приложения, сначала войдите в профиль."
    joke="Дверь не заперта. Она просто делает вид, что очень серьёзная."
    primary-label="На главную"
    primary-action="home"
  />
</template>

<script setup lang="ts">
import ErrorDocPage from '~/components/error/ErrorDocPage.vue'

useSeoMeta({
  title: '401 — Нужен вход',
  description: 'Для доступа к этой странице требуется авторизация.',
  robots: 'noindex, nofollow',
})
</script>
