/** Raise OAuth CDN avatar URLs so profile tiles stay sharp on retina. */
export function upgradeAvatarUrl(url: string): string {
  if (!url || url.startsWith('data:')) return url

  if (url.includes('avatars.yandex.net/get-yapic/')) {
    return url.replace(/\/islands-[^/?#]+/i, '/orig')
  }

  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith('googleusercontent.com')) return url
    parsed.pathname = parsed.pathname.replace(/=s\d+(-c)?(-[a-z]+)?$/i, '=s720-c')
    if (!/=s\d+/i.test(parsed.pathname) && parsed.searchParams.has('sz')) {
      parsed.searchParams.set('sz', '720')
    }
    return parsed.toString()
  } catch {
    return url.replace(/=s\d+(-c)?(-[a-z]+)?/i, '=s720-c')
  }
}
