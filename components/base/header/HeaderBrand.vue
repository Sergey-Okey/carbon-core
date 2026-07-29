<template>
  <div class="header-brand">
    <img class="header-brand__mark" src="/favicon.svg" alt="" aria-hidden="true" />
    <div class="header-brand__text">
      <span class="logo-text">CORE OF LIFE</span>
      <span class="logo-icon">COF</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.header-brand__mark {
  width: var(--space-8);
  height: var(--space-8);
  flex: 0 0 auto;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;

  @include mobile {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-full);
  }
}

.header-brand__text {
  min-width: 0;
  color: var(--color-text-primary);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
  letter-spacing: 0;

  .logo-text {
    display: inline;
  }

  .logo-icon {
    display: none;
  }

  @include mobile {
    .logo-text {
      display: none;
    }

    .logo-icon {
      display: inline;
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
    }
  }
}
</style>
