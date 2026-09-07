import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { fetch_current_user, type CurrentUser } from '@/lib/api/current_user'
import { get_err_message, type FetchStatus } from '@/lib/utils'

type CurrentUserContextValue = {
    user: CurrentUser | null
    status: FetchStatus
    error: string
    reload: () => Promise<void>
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)

export function CurrentUserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null)
    const [status, setStatus] = useState<FetchStatus>('idle')
    const [error, setError] = useState('')

    const reload = useCallback(async () => {
        setStatus('loading')
        setError('')
        try {
            const next = await fetch_current_user({ force: true })
            setUser(next)
            setStatus('ready')
        } catch (err) {
            setUser(null)
            setError(get_err_message(err))
            setStatus('error')
        }
    }, [])

    useEffect(() => {
        void reload()
    }, [reload])

    const value = useMemo(() => ({ user, status, error, reload }), [user, status, error, reload])

    return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser() {
    const ctx = useContext(CurrentUserContext)
    if (!ctx) {
        throw new Error('useCurrentUser 必须在 CurrentUserProvider 内使用')
    }
    return ctx
}
