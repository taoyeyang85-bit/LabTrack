import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadRuntimeConfig } from './lib/apiConfig';
import { applyTheme, getInitialTheme, ThemeProvider } from './hooks/useTheme';
import './styles.css';

applyTheme(getInitialTheme());

async function bootstrap() {
  await loadRuntimeConfig();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}

void bootstrap();
