export type NavId = 'home'

export const PRIMARY_NAV: { id: NavId; label: string }[] = [{ id: 'home', label: '首页' }]

export const NAV_LABEL: Record<NavId, string> = {
    home: '首页',
}
