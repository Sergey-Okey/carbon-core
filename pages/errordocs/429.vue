<template>
  <ErrorDocPage
    :code="429"
    eyebrow="Слишком много запросов"
    title="Нужна небольшая пауза"
    description="Сервер просит чуть-чуть передохнуть и попробовать ещё раз позже."
    joke="Даже хорошие идеи иногда лучше отправлять по одной."
    primary-label="Обновить страницу"
    primary-action="reload"
  />
</template>

<script setup lang="ts">
import ErrorDocPage from '~/components/error/ErrorDocPage.vue'
</script>
