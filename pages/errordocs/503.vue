<template>
  <ErrorDocPage
    :code="503"
    eyebrow="Технические работы"
    title="Сервис временно недоступен"
    description="Сейчас идёт восстановление работы. Попробуйте зайти ещё раз чуть позже."
    joke="Сервер вышел за кофе и обещал вернуться собранным."
    primary-label="Проверить снова"
    primary-action="reload"
  />
</template>

<script setup lang="ts">
import ErrorDocPage from '~/components/error/ErrorDocPage.vue'
</script>
