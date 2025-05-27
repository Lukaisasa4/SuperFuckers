import js from '@eslint/js' // Importa la configuración base de ESLint para JS
import globals from 'globals' // Importa los objetos globales para diferentes entornos
import reactHooks from 'eslint-plugin-react-hooks' // Importa el plugin de reglas para React Hooks
import reactRefresh from 'eslint-plugin-react-refresh' // Importa el plugin para React Refresh

export default [
  { ignores: ['dist'] }, // Ignora la carpeta 'dist' en el análisis
  {
    files: ['**/*.{js,jsx}'], // Aplica la configuración a todos los archivos JS y JSX
    languageOptions: {
      ecmaVersion: 2020, // Usa ECMAScript 2020
      globals: globals.browser, // Usa los objetos globales del entorno navegador
      parserOptions: {
        ecmaVersion: 'latest', // Usa la última versión de ECMAScript
        ecmaFeatures: { jsx: true }, // Habilita el soporte para JSX
        sourceType: 'module', // Usa módulos ECMAScript
      },
    },
    plugins: {
      'react-hooks': reactHooks, // Añade el plugin de React Hooks
      'react-refresh': reactRefresh, // Añade el plugin de React Refresh
    },
    rules: {
      ...js.configs.recommended.rules, // Incluye las reglas recomendadas de ESLint
      ...reactHooks.configs.recommended.rules, // Incluye las reglas recomendadas de React Hooks
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Error si hay variables sin usar, excepto si empiezan por mayúscula o guion bajo
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ], // Advierte si se exportan componentes de forma incorrecta para React Refresh
    },
  },
]