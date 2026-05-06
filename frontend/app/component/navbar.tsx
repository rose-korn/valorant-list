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
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1923]/95 border-b border-[#ff4654]/30 backdrop-blur-sm">
                <div className="flex items-center justify-between px-5 md:px-10 h-14">

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

                        {/* Hamburger — mobile */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden flex flex-col gap-1.5 p-2"
                        >
                            <span
                                className="block w-5 h-0.5 bg-white transition-all duration-200"
                                style={{ transform: menuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }}
                            />
                            <span
                                className="block w-5 h-0.5 bg-white transition-all duration-200"
                                style={{ opacity: menuOpen ? 0 : 1 }}
                            />
                            <span
                                className="block w-5 h-0.5 bg-white transition-all duration-200"
                                style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }}
                            />
                        </button>
                    </div>

                </div>

                {/* Mobile menu — dropdown */}
                <div
                    className="md:hidden overflow-hidden transition-all duration-300"
                    style={{ maxHeight: menuOpen ? '300px' : '0px' }}
                >
                    <div
                        className="border-t border-white/10 bg-[#0f1923] py-4 flex flex-col gap-4"
                        style={{ paddingLeft: '32px', paddingRight: '20px' }}
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
                            className="bg-[#ff4654] text-white text-xs tracking-widest uppercase py-2 rounded-sm hover:bg-[#e03545] transition-colors text-center mt-2"
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