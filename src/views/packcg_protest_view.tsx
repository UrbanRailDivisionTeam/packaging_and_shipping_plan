import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { toast } from 'sonner'

import { type DataTableFeatures } from '@/components/data-table-features'
import { DataToolbar } from '@/components/data-toolbar'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { delete_data } from '@/lib/api/packcg_protest_delete'
import { save_data } from '@/lib/api/packcg_protest_save'
import { fetch_data } from '@/lib/api/packcg_protest_select'
import type { BillRow } from '@/lib/api/packcg_protest_type'
import { useCurrentUser } from '@/lib/current_user_context'
import { get_err_message, type FetchStatus } from '@/lib/utils'

const columnHelper = createColumnHelper<DataTableFeatures, BillRow>()

function random_token(length = 5) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

function format_text(value: string | null | undefined) {
    if (value == null || value === '') return '-'
    return value
}

function StatusBadge({ status }: { status: string }) {
    if (!status) return <span className="text-muted-foreground">-</span>
    if (status === '暂存') {
        return (
            <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary">
                {status}
            </Badge>
        )
    }
    return <Badge variant="default">{status}</Badge>
}

const columns = columnHelper.columns([
    columnHelper.accessor('billno', {
        header: '单据编号',
    }),
    columnHelper.accessor('billstatus_title', {
        header: '单据状态',
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    }),
    columnHelper.accessor('crrc_largetextfield_tag', {
        header: '标签',
        cell: ({ getValue }) => format_text(getValue()),
    }),
    columnHelper.accessor('createtime', {
        header: '创建时间',
        cell: ({ getValue }) => format_text(getValue()),
    }),
    columnHelper.accessor('modifytime', {
        header: '修改时间',
        cell: ({ getValue }) => format_text(getValue()),
    }),
])

export function PackcgProtestView() {
    const [status, setStatus] = useState<FetchStatus>('idle')
    const [rows, setRows] = useState<BillRow[]>([])
    const [error, setError] = useState('')
    const [selected, setSelected] = useState<BillRow | null>(null)
    const [saving, setSaving] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [billno, setBillno] = useState('')
    const [tag, setTag] = useState('')
    const { user } = useCurrentUser()

    async function run(force: boolean) {
        setStatus('loading')
        setError('')
        try {
            const data = await fetch_data({ force })
            setRows(data)
            setStatus('ready')
        } catch (err) {
            setError(get_err_message(err))
            setStatus('error')
        }
    }

    useEffect(() => {
        void run(false)
    }, [])

    function openAdd() {
        setBillno(random_token())
        setTag(random_token())
        setAddOpen(true)
    }

    async function confirmSave() {
        const nextBillno = billno.trim()
        const nextTag = tag.trim()
        if (!nextBillno) {
            toast.error('请填写单据编号')
            return
        }
        if (!nextTag) {
            toast.error('请填写标签')
            return
        }
        setSaving(true)
        try {
            const result = await save_data({ billno: nextBillno, crrc_largetextfield_tag: nextTag })
            toast.success('保存成功', { description: result[0]?.type ? `${nextBillno} (${result[0].type})` : nextBillno })
            setAddOpen(false)
            await run(true)
        } catch (err) {
            toast.error('保存失败', { description: get_err_message(err) })
        } finally {
            setSaving(false)
        }
    }

    async function confirmDelete() {
        if (!selected) return
        setSaving(true)
        try {
            await delete_data(selected.billno)
            toast.success('删除成功', { description: selected.billno })
            setDeleteOpen(false)
            setSelected(null)
            await run(true)
        } catch (err) {
            toast.error('删除失败', { description: get_err_message(err) })
        } finally {
            setSaving(false)
        }
    }

    const loading = status === 'loading' || saving
    const emptyText = status === 'loading' ? '正在加载单据…' : status === 'error' ? error || '加载失败' : '暂无单据'

    return (
        <div className="relative flex min-h-0 flex-1 flex-col gap-2.5">
            <DataTable
                columns={columns}
                data={rows}
                emptyText={emptyText}
                getRowId={(row) => row.id}
                selectedRowId={selected?.id}
                onRowSelect={setSelected}
                enableSearch
                toolbar={
                    <DataToolbar
                        actions={[
                            { key: 'refresh', label: status === 'loading' ? '加载中…' : '刷新', variant: 'default', disabled: loading },
                            { key: 'add', label: '新增', disabled: loading },
                            { key: 'delete', label: '删除', disabled: loading || !selected },
                        ]}
                        onAction={(key) => {
                            if (key === 'refresh') void run(true)
                            if (key === 'add') openAdd()
                            if (key === 'delete') setDeleteOpen(true)
                        }}
                    />
                }
            />
            <Dialog
                open={addOpen}
                onOpenChange={(open) => {
                    if (!open && !saving) setAddOpen(false)
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>新增单据</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>单据编号</FieldLabel>
                            <Input value={billno} onChange={(event) => setBillno(event.target.value)} />
                        </Field>
                        <Field>
                            <FieldLabel>标签</FieldLabel>
                            <Input value={tag} onChange={(event) => setTag(event.target.value)} />
                        </Field>
                        <p className="text-muted-foreground text-xs">当前用户：{user ? `${user.userName} (${user.userCode})` : '未获取到苍穹会话用户'}</p>
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={saving} onClick={() => setAddOpen(false)}>
                            取消
                        </Button>
                        <Button type="button" disabled={saving} onClick={() => void confirmSave()}>
                            {saving ? '保存中…' : '保存'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    if (!saving) setDeleteOpen(open)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确定删除？</AlertDialogTitle>
                        <AlertDialogDescription>将删除单据 {selected?.billno}，此操作不可撤销。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={saving}>取消</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" disabled={saving} onClick={() => void confirmDelete()}>
                            {saving ? '删除中…' : '删除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
