import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export default defineBoot(({ app }) => {
  // Get saved language from localStorage or default to en-US
  let savedLocale = localStorage.getItem('user-language') || 'en-US'

  // Normalize locale: convert 'en' to 'en-US' and 'fr' to 'fr-FR'
  if (savedLocale === 'en') savedLocale = 'en-US'
  if (savedLocale === 'fr') savedLocale = 'fr-FR'

  const i18n = createI18n({
    locale: savedLocale,
    fallbackLocale: 'en-US',
    legacy: false,
    globalInjection: true,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
})
