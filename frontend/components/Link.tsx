'use client'

import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import { withLang } from '@/lib/i18n'
import { useI18n } from './LangProvider'

/** next/link ที่เติม /th หรือ /en ให้เอง — เขียนลิงก์ในเว็บเป็น '/agents' เหมือนเดิมได้เลย */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { lang } = useI18n()
  return <NextLink href={typeof href === 'string' ? withLang(lang, href) : href} {...props} />
}
