import { type CqPageResponse } from '@/lib/config'

export type BillRow = {
    id: string
    billno: string
    billstatus: string
    billstatus_title: string
    auditdate: string | null
    modifytime: string
    createtime: string
    crrc_largetextfield: string
    crrc_largetextfield_tag: string
}

export type BillSaveRow = {
    billno: string
    crrc_largetextfield_tag: string
}

export type BillSaveRequest = {
    data: BillSaveRow[]
}

export type BillSaveError = {
    entityKey: string
    entryRowIndex: number | null
    keys: {
        billno: string | null
    }
    rowMsg: string[]
    subEntryRowIndex: number | null
}

export type BillSaveResult = {
    billIndex: number
    billStatus: boolean
    errors: BillSaveError[]
    id: string | null
    keys: {
        billno: string | null
    }
    number: string | null
    type: string | null
}

export type BillSaveResponse = {
    status: boolean
    errorCode: string
    message: string | null
    data: {
        failCount: string
        successCount: string
        result: BillSaveResult[]
    } | null
}

export type BillDeleteRequest = {
    data: {
        billno: string
    }
}

export type BillDeleteResult = {
    billStatus: boolean
    errors: unknown[]
    id: string
    number: string
}

export type BillDeleteResponse = {
    status: boolean
    errorCode: string
    message: string | null
    data: {
        failCount?: string
        filter?: string
        successCount?: string
        totalCount?: string
        result?: BillDeleteResult[]
    } | null
}

export type CrrcBillPageResponse = CqPageResponse<BillRow>
