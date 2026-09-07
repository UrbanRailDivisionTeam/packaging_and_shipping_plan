import { cq_fetch } from '@/lib/cq_fetch'
import { CACHE_TTL_MS, CQ_API_PATH, CQ_OPENAPI } from '@/lib/config'
import type { BillRow, CrrcBillPageResponse } from '@/lib/api/packcg_protest_type'

let inflight: Promise<BillRow[]> | null = null
let lastRows: BillRow[] | null = null
let lastFetchTime = 0

function is_cache_expired() {
    return Date.now() - lastFetchTime > CACHE_TTL_MS
}

export function clear_packcg_protest_cache() {
    lastRows = null
    lastFetchTime = 0
}

export function fetch_data(options?: { force?: boolean }): Promise<BillRow[]> {
    if (inflight) return inflight
    if (!options?.force && lastRows && !is_cache_expired()) {
        return Promise.resolve(lastRows)
    }
    const task = (async () => {
        const allRows: BillRow[] = []
        let pageNo = 1
        while (true) {
            const res = await cq_fetch(CQ_API_PATH.packcg_protest_select, {
                method: 'POST',
                body: JSON.stringify({
                    data: {},
                    pageSize: CQ_OPENAPI.pageSize,
                    pageNo,
                }),
            })
            const json = (await res.json()) as CrrcBillPageResponse
            if (!json.status) {
                throw new Error(`查询失败: ${json.message || '未知错误'} (errorCode: ${json.errorCode || '无'})`)
            }
            if (!json.data) {
                throw new Error('查询失败: 响应缺少 data 字段')
            }
            allRows.push(...json.data.rows)
            if (json.data.lastPage) break
            pageNo++
            if (pageNo > CQ_OPENAPI.maxPages) {
                throw new Error(`查询失败: 超出最大页数 ${CQ_OPENAPI.maxPages}`)
            }
        }
        return allRows
    })()
        .then((rows) => {
            lastRows = rows
            lastFetchTime = Date.now()
            return rows
        })
        .finally(() => {
            if (inflight === task) inflight = null
        })

    inflight = task
    return task
}
