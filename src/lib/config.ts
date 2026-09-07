export const CQ_OPENAPI = {
    // 本地走 Vite `/ierp` 代理，避免浏览器直连远程网关触发 CORS
    gateway: import.meta.env.DEV ? '/ierp' : 'https://cangqiongtestzelc.crrcgc.cc:6888/ierp',
    /** 基本认证：所有 kapi 请求在 Query 中追加 openApiSign */
    openApiSign: 'TzBPaFZudWc2YzZkbjJvRXBXblF2d18ySlNGYndLV2VOWFpiMG1FR2laTT06OTU2NTk5ODQ0NjQ5MDQyOTQ0',
    pageSize: 100,
    maxPages: 50,
}

export const CQ_API_PATH = {
    packcg_protest_select: '/kapi/v2/crrc/crrc_process_module_const/crrc_packcg_protest/select',
    packcg_protest_save: '/kapi/v2/crrc/crrc_process_module_const/crrc_packcg_protest/save',
    packcg_protest_delete: '/kapi/v2/crrc/crrc_process_module_const/crrc_packcg_protest/delete',
    current_user: '/kapi/v2/crrc/crrc_itsm/get_current_user/info',
}

export type CqPageResponse<T> = {
    status: boolean
    errorCode: string
    message: string | null
    data: {
        filter: string
        lastPage: boolean
        pageNo: number
        pageSize: number
        totalCount: number
        rows: T[]
    }
}

export const CACHE_TTL_MS = 10 * 60 * 1000
