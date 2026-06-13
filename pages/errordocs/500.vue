<template>
  <ErrorDocPage
    :code="500"
    eyebrow="Внутренняя ошибка"
    title="Что-то внутри решило импровизировать"
    description="Мы не планировали такой сценарий. Попробуйте перезагрузить страницу."
    joke="Код уверял, что всё под контролем. Код, как выяснилось, преувеличивал."
    primary-label="Обновить страницу"
    primary-action="reload"
  />
</template>

<script setup lang="ts">
import ErrorDocPage from '~/components/error/ErrorDocPage.vue'
</script>
