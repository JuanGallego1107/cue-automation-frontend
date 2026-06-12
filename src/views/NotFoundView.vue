<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página no encontrada</p>
    <router-link to="/">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--c-bg);
  color: var(--c-text);
  gap: 1rem;
}

.not-found h1 { font-size: 6rem; font-weight: 900; color: var(--c-primary); opacity: 0.25; margin: 0; }
.not-found p { font-size: 1.25rem; color: var(--c-text-muted); }
.not-found a {
  color: var(--c-primary);
  text-decoration: none;
  border: 1px solid var(--c-primary);
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  transition: all 0.2s;
  font-weight: 600;
}
.not-found a:hover { background: var(--c-primary-pale); }
</style>
