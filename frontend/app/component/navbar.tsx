import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 bg-[#0f1923]/95 border-b border-[#ff4654]/30 backdrop-blur-sm">

            <Link href="/" style={{ fontFamily: 'var(--font-rajdhani)' }} className="font-bold tracking-widest text-[#ff4654] uppercase text-xl">
                Valorant List
            </Link>

            <ul className="flex gap-8 list-none m-0 p-0">
                <li>
                    <Link href="/agents" className="text-xs tracking-widest uppercase text-white/80 hover:text-[#ff4654] transition-colors">
                        Agents
                    </Link>
                </li>
                <li>
                    <Link href="/maps" className="text-xs tracking-widest uppercase text-white/80 hover:text-[#ff4654] transition-colors">
                        Maps
                    </Link>
                </li>
                <li>
                    <Link href="/weapons" className="text-xs tracking-widest uppercase text-white/80 hover:text-[#ff4654] transition-colors">
                        Weapons
                    </Link>
                </li>
            </ul>

            <a
                href="https://playvalorant.com"
                target="_blank"
                className="bg-[#ff4654] text-white text-xs tracking-widest uppercase px-5 py-2 rounded-sm hover:bg-[#e03545] transition-colors"
            >
                Play Free
            </a>

        </nav>
    )
}