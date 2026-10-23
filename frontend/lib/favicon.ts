// สลับ favicon ของแท็บชั่วคราว (ฝั่ง browser เท่านั้น) แล้วคืนค่าเดิมได้
import { type MarkVariant, markDataUri } from './mark'

const cache = new Map<MarkVariant, string>()

export function setFavicon(variant: MarkVariant | null) {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')
  links.forEach((link) => {
    link.dataset.origHref ??= link.getAttribute('href') ?? ''
    if (!variant) {
      link.href = link.dataset.origHref
      return
    }
    if (!cache.has(variant)) cache.set(variant, markDataUri(variant))
    link.href = cache.get(variant)!
  })
}
