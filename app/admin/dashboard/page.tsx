import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileCheck, AlertCircle } from "lucide-react"
import { getStats } from "../certificates/actions"

export default async function DashboardPage() {
    const { total, active, failed } = await getStats()

    const stats = [
        {
            title: "Total Certificates",
            value: total.toString(),
            icon: FileCheck,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
        },
        {
            title: "Active Codes",
            value: active.toString(),
            icon: Users,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
        },
        {
            title: "Failed Attempts",
            value: failed.toString(),
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/20",
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400">Overview of your certificate system.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-500 text-center py-8">Check the Certificates tab for details.</p>
                </div>
            </div>
        </div>
    )
}
