import { cq_fetch } from '@/lib/cq_fetch'
import { CQ_API_PATH } from '@/lib/config'
import { clear_packcg_protest_cache } from '@/lib/api/packcg_protest_select'
import type { BillSaveError, BillSaveRequest, BillSaveResponse, BillSaveResult, BillSaveRow } from '@/lib/api/packcg_protest_type'

function format_row_errors(errors: BillSaveError[]) {
    return errors
        .flatMap((err) => err.rowMsg)
        .filter(Boolean)
        .join('；')
}

function format_failed_items(items: BillSaveResult[]) {
    return items
        .map((item) => {
            const billno = item.number || item.keys?.billno || '未知'
            const detail = format_row_errors(item.errors)
            return detail ? `billno=${billno} ${detail}` : `billno=${billno}`
        })
        .join('; ')
}

export async function save_data(rows: BillSaveRow | BillSaveRow[]): Promise<BillSaveResult[]> {
    const data = Array.isArray(rows) ? rows : [rows]
    const body: BillSaveRequest = { data }
    const res = await cq_fetch(CQ_API_PATH.packcg_protest_save, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    const json = (await res.json()) as BillSaveResponse
    if (!json.status) {
        const from_result = json.data?.result?.length ? format_failed_items(json.data.result) : ''
        throw new Error(`保存失败: ${json.message || from_result || '未知错误'} (errorCode: ${json.errorCode || '无'})`)
    }
    if (!json.data) {
        throw new Error(`保存失败: 响应缺少 data 字段 (errorCode: ${json.errorCode || '无'})`)
    }
    const failed = json.data.result.filter((item) => item.billStatus !== true)
    if (failed.length) {
        throw new Error(`保存失败: ${failed.length} 条未成功。${format_failed_items(failed)}`)
    }
    clear_packcg_protest_cache()
    return json.data.result
}
