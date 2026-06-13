<template>
  <ErrorDocPage
    :code="404"
    eyebrow="Страница не найдена"
    title="Похоже, маршрут ушёл в отпуск"
    description="Ссылка могла устареть, измениться или страница была перемещена."
    joke="Мы поискали под диваном. Там тоже пусто."
    primary-label="На главную"
    primary-action="home"
  />
</template>

<script setup lang="ts">
import ErrorDocPage from '~/components/error/ErrorDocPage.vue'
</script>
