'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDeviceSize } from '@/hooks/useDeviceSize'

const NAV_LINKS = [
    { href: '/agents', label: 'Agents' },
    { href: '/maps', label: 'Maps' },
    { href: '/weapons', label: 'Weapons' },
    { href: '/news', label: 'News' },
]

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const { isMobile } = useDeviceSize()

    return (
        <>
            {/* Overlay — กดข้างนอกเพื่อปิด */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1923]/95 border-b border-[#ff4654]/30 backdrop-blur-sm">
                <div
                    className="flex items-center justify-between h-14"
                    style={{ paddingLeft: '32px', paddingRight: '24px' }}
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                        className="font-bold tracking-widest text-[#ff4654] uppercase text-lg md:text-xl whitespace-nowrap"
                    >
                        Valorant List
                    </Link>

                    {/* Links — desktop */}
                    <ul className="hidden md:flex gap-8 list-none m-0 p-0">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-xs tracking-widest uppercase text-white/80 hover:text-[#ff4654] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <a
                            href="https://playvalorant.com"
                            target="_blank"
                            className="hidden sm:block bg-[#ff4654] text-white text-xs tracking-widest uppercase px-4 py-2 rounded-sm hover:bg-[#e03545] transition-colors whitespace-nowrap"
                        >
                            Play Free
                        </a>

                        {/* Hamburger / X — mobile */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden w-8 h-8 flex items-center justify-center"
                        >
                            {menuOpen ? (
                                <span className="text-white text-lg leading-none">✕</span>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <span className="block w-5 h-0.5 bg-white" />
                                    <span className="block w-5 h-0.5 bg-white" />
                                    <span className="block w-5 h-0.5 bg-white" />
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className="md:hidden overflow-hidden transition-all duration-300"
                    style={{ maxHeight: menuOpen ? '300px' : '0px' }}
                >
                    <div
                        className="border-t border-white/10 bg-[#0f1923] py-4 flex flex-col gap-4"
                        style={{ paddingLeft: '32px', paddingRight: '32px' }}
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="text-xs tracking-widest uppercase text-white/60 hover:text-[#ff4654] transition-colors"
                                style={{ paddingLeft: '16px' }}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <a
                            href="https://playvalorant.com"
                            target="_blank"
                            className="bg-[#ff4654] text-white text-xs tracking-widest uppercase py-2 rounded-sm hover:bg-[#e03545] transition-colors text-center"
                            style={{ marginLeft: '16px' }}
                        >
                            Play Free
                        </a>
                    </div>
                </div>
            </nav >
        </>
    )
}