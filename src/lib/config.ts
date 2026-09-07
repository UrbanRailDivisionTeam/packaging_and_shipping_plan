export const CQ_OPENAPI = {
    // 本地走 Vite `/ierp` 代理，避免浏览器直连远程网关触发 CORS
    gateway: import.meta.env.DEV ? '/ierp' : 'https://cangqiongtestzelc.crrcgc.cc:6888/ierp',
    /** 基本认证：所有 kapi 请求在 Query 中追加 openApiSign */
    openApiSign: 'TzBPaFZudWc2YzZkbjJvRXBXblF2d18ySlNGYndLV2VOWFpiMG1FR2laTT06OTU2NTk5ODQ0NjQ5MDQyOTQ0',
    pageSize: 100,
    maxPages: 50,
}

export const CQ_API_PATH = {
    // 在此登记本项目的 kapi 路径，例如：
    // packing_plan: '/kapi/v2/.../packing_plan',
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
