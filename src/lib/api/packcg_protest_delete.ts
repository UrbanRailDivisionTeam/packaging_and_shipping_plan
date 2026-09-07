import { cq_fetch } from '@/lib/cq_fetch'
import { CQ_API_PATH } from '@/lib/config'
import { clear_packcg_protest_cache } from '@/lib/api/packcg_protest_select'
import type { BillDeleteRequest, BillDeleteResponse, BillDeleteResult } from '@/lib/api/packcg_protest_type'

export async function delete_data(billno: string): Promise<BillDeleteResult[]> {
    const body: BillDeleteRequest = { data: { billno } }
    const res = await cq_fetch(CQ_API_PATH.packcg_protest_delete, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    const json = (await res.json()) as BillDeleteResponse
    if (!json.status) {
        throw new Error(`删除失败: ${json.message || '未知错误'} (errorCode: ${json.errorCode || '无'})`)
    }
    const results = json.data?.result ?? []
    const failed = results.filter((item) => item.billStatus !== true)
    if (failed.length) {
        const detail = failed.map((item) => `billno=${item.number || '未知'} errors=${JSON.stringify(item.errors)}`).join('; ')
        throw new Error(`删除失败: ${failed.length} 条未成功。${detail}`)
    }
    clear_packcg_protest_cache()
    return results
}
