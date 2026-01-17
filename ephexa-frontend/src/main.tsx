import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { api } from './services/api'
import { useAuthStore } from './stores/authStore'

// Initialize API token from persisted store
const token = useAuthStore.getState().token;
if (token) {
  api.setToken(token);
}

// Subscribe to token changes
useAuthStore.subscribe((state) => {
  api.setToken(state.token);
});

createRoot(document.getElementById('root')!).render(
  <App />
)
