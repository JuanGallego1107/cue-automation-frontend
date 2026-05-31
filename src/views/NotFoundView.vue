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
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: white;
  gap: 1rem;
}

.not-found h1 { font-size: 6rem; font-weight: 900; opacity: 0.2; margin: 0; }
.not-found p { font-size: 1.25rem; opacity: 0.6; }
.not-found a {
  color: #667eea;
  text-decoration: none;
  border: 1px solid #667eea;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  transition: all 0.2s;
}
.not-found a:hover { background: rgba(102,126,234,0.15); }
</style>
