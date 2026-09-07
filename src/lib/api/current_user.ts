import { cq_fetch } from '@/lib/cq_fetch'
import { CACHE_TTL_MS, CQ_API_PATH } from '@/lib/config'
import { as_string } from '@/lib/utils'

export type CurrentUser = {
    userId: string
    userName: string
    userCode: string
    phone: string
    picturefield: string
}

type LocaleName = {
    zh_CN?: string
    zh_TW?: string
    en_US?: string
    GLang?: string
    [key: string]: string | undefined
}

type CurrentUserResponse = {
    status: boolean
    errorCode?: string
    message: string | null
    data: {
        userId?: string | number
        userName?: string | LocaleName
        userCode?: string
        phone?: string
        picturefield?: string
    } | null
}

let inflight: Promise<CurrentUser> | null = null
let lastUser: CurrentUser | null = null
let lastFetchTime = 0

function is_cache_expired() {
    return Date.now() - lastFetchTime > CACHE_TTL_MS
}

/** 苍穹 userId 超过 JS 安全整数，入库 JSON 可能是 19 位数字，解析时先转成字符串 */
function quote_large_ints(text: string) {
    return text.replace(/:(\s*)(-?\d{16,})(\s*[,}\]])/g, ':$1"$2"$3')
}

function locale_text(value: unknown): string {
    if (value == null) return ''
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim()
    if (typeof value === 'object') {
        const rec = value as Record<string, unknown>
        for (const key of ['zh_CN', 'GLang', 'zh_TW', 'en_US']) {
            const text = rec[key]
            if (typeof text === 'string' && text.trim()) return text.trim()
        }
        for (const text of Object.values(rec)) {
            if (typeof text === 'string' && text.trim()) return text.trim()
        }
    }
    return ''
}

function to_user(data: NonNullable<CurrentUserResponse['data']>): CurrentUser {
    const userId = as_string(data.userId).trim()
    const userName = locale_text(data.userName)
    const userCode = as_string(data.userCode).trim()
    if (!userId && !userName && !userCode) {
        throw new Error('当前用户响应缺少 userId / userName / userCode')
    }
    return {
        userId,
        userName,
        userCode,
        phone: as_string(data.phone).trim(),
        picturefield: as_string(data.picturefield).replace('/ierp//', '/ierp/').trim(),
    }
}

export function clear_current_user_cache() {
    lastUser = null
    lastFetchTime = 0
}

/**
 * 取苍穹当前会话用户。需要已有苍穹登录上下文（cookie），不是 openApiSign 域账号校验。
 * 页面插件挂在同源 iframe 时会带上会话；本地 Vite 无登录 cookie 时会失败。
 */
export function fetch_current_user(options?: { force?: boolean }): Promise<CurrentUser> {
    if (inflight) return inflight
    if (!options?.force && lastUser && !is_cache_expired()) {
        return Promise.resolve(lastUser)
    }
    const task = (async () => {
        const res = await cq_fetch(CQ_API_PATH.current_user, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({}),
        })
        const text = await res.text()
        let json: CurrentUserResponse
        try {
            json = JSON.parse(quote_large_ints(text)) as CurrentUserResponse
        } catch {
            throw new Error(`获取当前用户失败: 响应不是 JSON (HTTP ${res.status})`)
        }
        if (!json.status) {
            throw new Error(`获取当前用户失败: ${json.message || '未登录或会话无效'} (errorCode: ${json.errorCode || '无'})`)
        }
        if (!json.data) {
            throw new Error('获取当前用户失败: 响应缺少 data 字段')
        }
        return to_user(json.data)
    })()
        .then((user) => {
            lastUser = user
            lastFetchTime = Date.now()
            return user
        })
        .finally(() => {
            if (inflight === task) inflight = null
        })

    inflight = task
    return task
}
