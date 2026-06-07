<template>
  <PublicInfoPage eyebrow="Документы" title="Политика конфиденциальности" lead="Какие данные использует Core of Life и как пользователь ими управляет.">
    <h2>Локальные данные</h2>
    <p>В локальном режиме задачи, настройки, профиль и резервные копии остаются на устройстве пользователя.</p>
    <h2>Облачный режим</h2>
    <p>При выборе облачного режима сервер хранит email, профиль и синхронизируемое состояние приложения. Пароли сохраняются только в виде криптографического хеша.</p>
    <h2>Права пользователя</h2>
    <p>Данные можно экспортировать, удалить локально или удалить вместе с облачным аккаунтом из профиля.</p>
    <h2>Контакт</h2>
    <p><a href="mailto:sergeyborisov_1@vk.ru">sergeyborisov_1@vk.ru</a></p>
  </PublicInfoPage>
</template>
<script setup lang="ts">
import PublicInfoPage from '~/components/base/PublicInfoPage.vue'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Политика конфиденциальности', robots: 'index, follow' })
</script>
