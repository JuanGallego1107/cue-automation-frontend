<template>
  <div class="forbidden-page">
    <div class="glass-card">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          <circle cx="12" cy="16" r="1.5"/>
        </svg>
      </div>
      
      <h1>403</h1>
      <h2>Acceso Restringido</h2>
      <p>No tienes los permisos necesarios para ver esta sección. Si consideras que esto es un error, por favor contacta al administrador del sistema.</p>
      
      <RouterLink to="/dashboard" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Regresar al Dashboard
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  background: var(--c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
}

.glass-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 24px;
  padding: 3rem 2rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(17, 85, 156, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-container {
  width: 72px;
  height: 72px;
  background: var(--c-danger-pale);
  border: 1px solid rgba(207, 99, 107, 0.25);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-danger);
  margin-bottom: 1.5rem;
}

.icon-container svg {
  width: 32px;
  height: 32px;
}

h1 {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  color: var(--c-danger);
}

h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0.5rem 0 1rem;
}

p {
  font-size: 0.9rem;
  color: var(--c-text-muted);
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--c-primary);
  border: none;
  border-radius: 12px;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #0e4a88;
  transform: translateY(-1px);
}

.btn-back svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.btn-back:hover svg {
  transform: translateX(-3px);
}
</style>
