<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <img src="/owlsight-logo.svg" alt="Owlsight" class="logo-img" />
        </div>
        <h1>Owlsight</h1>
        <p>Inicia sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group" :class="{ 'has-error': authStore.validationErrors.email }">
          <label for="email">Correo electrónico</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="admin@cue.edu.co"
              autocomplete="email"
              required
            />
          </div>
          <span v-if="authStore.validationErrors.email" class="error-msg">{{ authStore.validationErrors.email[0] }}</span>
        </div>

        <div class="form-group" :class="{ 'has-error': authStore.validationErrors.password }">
          <label for="password">Contraseña</label>
          <div class="input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="authStore.validationErrors.password" class="error-msg">{{ authStore.validationErrors.password[0] }}</span>
        </div>

        <div v-if="authStore.error" class="alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn-login" :disabled="authStore.loading" id="btn-login">
          <span v-if="authStore.loading" class="spinner"></span>
          <span v-else>Iniciar sesión</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  try {
    await authStore.login(form)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch {
    // Los errores ya están en authStore.error y authStore.validationErrors
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #11559C 0%, #0d4080 100%);
  padding: 1rem;
}

.login-card {
  background: #ffffff;
  border: 1px solid var(--c-border);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.logo-img {
  width: 88px;
  height: 88px;
  object-fit: contain;
  display: block;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.login-header p {
  color: var(--c-text-muted);
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--c-text);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper > svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--c-text-muted);
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 0.875rem 2.75rem 0.875rem 2.75rem;
  color: var(--c-text);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

.input-wrapper input:focus {
  border-color: var(--c-primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--c-primary-pale);
}

.has-error .input-wrapper input {
  border-color: var(--c-danger);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text-muted);
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  z-index: 2;
}

.toggle-password:hover { color: var(--c-text); }
.toggle-password svg { width: 18px; height: 18px; }

.error-msg {
  font-size: 0.8rem;
  color: var(--c-danger);
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--c-danger-pale);
  border: 1px solid rgba(207, 99, 107, 0.3);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: var(--c-danger);
  font-size: 0.875rem;
}

.alert-error svg { width: 18px; height: 18px; flex-shrink: 0; }

.btn-login {
  margin-top: 0.5rem;
  background: var(--c-primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(17, 85, 156, 0.3);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #0e4a88;
  box-shadow: 0 6px 20px rgba(17, 85, 156, 0.4);
}

.btn-login:active:not(:disabled) { transform: translateY(0); }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
