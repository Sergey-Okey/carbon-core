<template>
  <PublicInfoPage eyebrow="Помощь" title="Поддержка" lead="Сообщите об ошибке или предложите улучшение.">
    <h2>Перед обращением</h2>
    <ul>
      <li>Экспортируйте резервную копию в настройках.</li>
      <li>Укажите устройство, браузер или версию Android.</li>
      <li>Опишите шаги, после которых появилась проблема.</li>
    </ul>
    <h2>Связаться</h2>
    <p><a href="mailto:sergeyborisov_1@vk.ru?subject=Core%20of%20Life%20support">Написать в поддержку</a></p>
  </PublicInfoPage>
</template>
<script setup lang="ts">
import PublicInfoPage from '~/components/base/PublicInfoPage.vue'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Поддержка', robots: 'index, follow' })
</script>
