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
  background: #0d0b1e;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 3rem 2rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-container {
  width: 72px;
  height: 72px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f87171;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.15);
}

.icon-container svg {
  width: 32px;
  height: 32px;
}

h1 {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #f87171, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: white;
  margin: 0.5rem 0 1rem;
}

p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
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
