const getEnvVar = (key: keyof ImportMetaEnv, defaultValue?: string): string => {
  const value = import.meta.env[key] || defaultValue;
  
  if (!value) {
    console.warn(`Environment variable ${key} is not defined. Using default or empty value.`);
    return defaultValue || '';
  }
  
  return value;
};

export const env = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  telegram: {
    botToken: getEnvVar('VITE_TELEGRAM_BOT_TOKEN', ''),
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'TudaSuda'),
    url: getEnvVar('VITE_APP_URL', 'http://localhost:3000'),
  },
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;