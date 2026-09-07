import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function HomeView() {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle>空白项目</CardTitle>
                    <CardDescription>脚手架已就绪，可在此开始包装与发运计划的页面开发。</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2 text-sm">
                    <p>在 `src/lib/nav.ts` 增加导航项，在 `src/views` 增加页面，在 `src/lib/api` 增加 kapi 封装。</p>
                    <p>本地开发走 Vite `/ierp` 代理；`pnpm build` 会产出可贴入苍穹插件的 `dist/index.js`。</p>
                </CardContent>
            </Card>
        </div>
    )
}
