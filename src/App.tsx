import { useEffect, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { CurrentUserProvider } from '@/lib/current_user_context'
import { closeOverlay } from '@/lib/shell'
import { NAV_LABEL, type NavId } from '@/lib/nav'
import { PackcgProtestView } from '@/views/packcg_protest_view'

export default function App() {
    const [active, setActive] = useState<NavId>('bills')
    const [dark, setDark] = useState(false)

    useEffect(() => {
        function onKeydown(event: KeyboardEvent) {
            if (event.key === 'Escape') closeOverlay()
        }
        document.addEventListener('keydown', onKeydown)
        return () => document.removeEventListener('keydown', onKeydown)
    }, [])

    function toggleTheme() {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
    }

    return (
        <CurrentUserProvider>
            <div className="bg-background flex h-svh overflow-hidden">
                <AppSidebar active={active} dark={dark} onNavigate={setActive} onToggleTheme={toggleTheme} onClose={closeOverlay} />
                <div className="flex min-w-0 flex-1 flex-col px-5.5 py-4.5 pb-3.5">
                    <header className="mb-2.5 flex items-center">
                        <h1 className="text-lg font-semibold tracking-tight">{NAV_LABEL[active]}</h1>
                    </header>
                    {active === 'bills' ? <PackcgProtestView /> : null}
                </div>
            </div>
        </CurrentUserProvider>
    )
}
