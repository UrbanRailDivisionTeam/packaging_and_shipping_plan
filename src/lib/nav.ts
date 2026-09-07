export type NavId = 'bills'

export const PRIMARY_NAV: { id: NavId; label: string }[] = [{ id: 'bills', label: '单据列表' }]

export const NAV_LABEL: Record<NavId, string> = {
    bills: '单据列表',
}
