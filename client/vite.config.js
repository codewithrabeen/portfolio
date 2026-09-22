import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const normalizePublicUrl = (value) => {
  if (!value) return ""

  try {
    const url = new URL(value)
    url.hash = ""
    url.search = ""

    return url.href.replace(/\/$/, "")
  } catch {
    return ""
  }
}

const createSeoHtmlPlugin = (env) => {
  const publicSiteUrl = normalizePublicUrl(env.VITE_PUBLIC_SITE_URL)
  const publicOgImage =
    env.VITE_PUBLIC_OG_IMAGE_URL ||
    (publicSiteUrl
      ? `${publicSiteUrl}/og-image.png`
      : "/og-image.png")

  return {
    name: "portfolio-seo-html",
    transformIndexHtml(html) {
      let next = html
        .replaceAll("%PUBLIC_SITE_URL%", publicSiteUrl)
        .replaceAll("%PUBLIC_OG_IMAGE_URL%", publicOgImage)

      if (!publicSiteUrl) {
        next = next
          .replace(
            /\n\s*<link\s+rel="canonical"\s+href=""\s+\/>/,
            ""
          )
          .replace(
            /\n\s*<meta\s+property="og:url"\s+content=""\s+\/>/,
            ""
          )
      }

      return next
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_")

  return {
    plugins: [react(), createSeoHtmlPlugin(env)],
  }
})
