'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCertificates, generateCertificate, getTemplatesList, removeCertificate } from './actions'
import { Plus, Copy, Check, Trash2 } from 'lucide-react'

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<any[]>([])
    const [filteredCertificates, setFilteredCertificates] = useState<any[]>([])
    const [templates, setTemplates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (!searchQuery) {
            setFilteredCertificates(certificates)
        } else {
            const lowerQuery = searchQuery.toLowerCase()
            setFilteredCertificates(
                certificates.filter(
                    (c) =>
                        c.name.toLowerCase().includes(lowerQuery) ||
                        c.code.toLowerCase().includes(lowerQuery)
                )
            )
        }
    }, [searchQuery, certificates])

    const loadData = async () => {
        const [certs, temps] = await Promise.all([getCertificates(), getTemplatesList()])
        const sorted = certs.reverse()
        setCertificates(sorted)
        setFilteredCertificates(sorted)
        setTemplates(temps)
        setLoading(false)
    }

    const handleGenerate = async (formData: FormData) => {
        const res = await generateCertificate(formData)
        if (res.success) {
            // Reset form
            const form = document.getElementById('generate-form') as HTMLFormElement
            form.reset()
            loadData() // Reload to get new certs
            alert(`Successfully generated ${res.count} certificates!`)
        } else if (res.error) {
            alert(res.error)
        }
    }

    const handleDelete = async (code: string) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return
        const res = await removeCertificate(code)
        if (res.success) {
            loadData()
        } else {
            alert(res.error)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(text)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Certificates</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage and generate certificates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generate Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Generate New</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form id="generate-form" action={handleGenerate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="templateId">Select Template</Label>
                                <select
                                    name="templateId"
                                    id="templateId"
                                    required
                                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-slate-200"
                                >
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Recipient Names (One per line)</Label>
                                <textarea
                                    id="name"
                                    name="name"
                                    placeholder="Jane Doe&#10;John Smith&#10;Alice Johnson"
                                    required
                                    className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Generate Certificates
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Recent Certificates</CardTitle>
                        <div className="w-1/2">
                            <Input
                                placeholder="Search by name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border mt-4">
                            <div className="relative w-full overflow-auto max-h-[600px]">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Code</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-gray-500">Loading...</td>
                                            </tr>
                                        ) : filteredCertificates.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-gray-500">No certificates found.</td>
                                            </tr>
                                        ) : (
                                            filteredCertificates.map((cert) => (
                                                <tr key={cert.code} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 font-mono font-medium">{cert.code}</td>
                                                    <td className="p-4">{cert.name}</td>
                                                    <td className="p-4">
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                                                            {cert.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-500">{new Date(cert.generatedAt).toLocaleDateString()}</td>
                                                    <td className="p-4 text-right space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => copyToClipboard(cert.code)}
                                                            title="Copy Code"
                                                        >
                                                            {copied === cert.code ? (
                                                                <Check className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(cert.code)}
                                                            title="Delete Certificate"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
