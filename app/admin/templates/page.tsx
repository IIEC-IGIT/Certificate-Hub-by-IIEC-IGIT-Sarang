'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { saveTemplateConfig, getTemplatesList, createTemplate, removeTemplate } from './actions'
import { Upload, Save, Plus, Trash2, Edit } from 'lucide-react'

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
    const [uploading, setUploading] = useState(false)

    // Local state for drag/positioning
    const [pos, setPos] = useState({ x: 50, y: 50 })
    const imageRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        loadTemplates()
    }, [])

    useEffect(() => {
        if (selectedTemplate) {
            setPos({ x: selectedTemplate.namePosition.x, y: selectedTemplate.namePosition.y })
        }
    }, [selectedTemplate])

    const loadTemplates = async () => {
        const list = await getTemplatesList()
        setTemplates(list)
        if (!selectedTemplate && list.length > 0) {
            setSelectedTemplate(list[0])
        } else if (selectedTemplate) {
            // Refresh selected
            const updated = list.find((t: any) => t.id === selectedTemplate.id)
            if (updated) setSelectedTemplate(updated)
        }
    }

    const handleCreate = async (formData: FormData) => {
        const res = await createTemplate(formData)
        if (res.success) {
            const form = document.getElementById('create-form') as HTMLFormElement
            form.reset()
            await loadTemplates()
            setSelectedTemplate(res.template)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return
        const res = await removeTemplate(id)
        if (res.success) {
            const list = await getTemplatesList()
            setTemplates(list)
            if (selectedTemplate?.id === id) {
                setSelectedTemplate(list[0] || null)
            }
        } else {
            alert(res.error)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !selectedTemplate) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])
        formData.append('templateId', selectedTemplate.id)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.success) {
                await loadTemplates()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async (formData: FormData) => {
        if (!selectedTemplate) return
        await saveTemplateConfig(selectedTemplate.id, formData)
        alert('Configuration saved!')
        await loadTemplates()
    }

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return
        const rect = imageRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setPos({ x, y })
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Templates</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage multiple certificate designs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar List */}
                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {templates.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t)}
                                        className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${selectedTemplate?.id === t.id ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'}`}
                                    >
                                        <span className="font-medium truncate">{t.name}</span>
                                        {templates.length > 1 && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t">
                                <form id="create-form" action={handleCreate} className="flex gap-2">
                                    <Input name="name" placeholder="New Template Name" required className="h-8 text-sm" />
                                    <Button type="submit" size="sm" className="h-8 w-8 p-0">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-9">
                    {selectedTemplate ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Controls */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Edit: {selectedTemplate.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Upload Image</Label>
                                        <div className="flex gap-2">
                                            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                            {uploading && <span className="text-sm text-gray-500 self-center">...</span>}
                                        </div>
                                    </div>

                                    <form action={handleSave} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Name Position</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs">X (%)</Label>
                                                    <Input name="x" type="number" step="0.1" value={pos.x.toFixed(1)} readOnly />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Y (%)</Label>
                                                    <Input name="y" type="number" step="0.1" value={pos.y.toFixed(1)} readOnly />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Font Size (px)</Label>
                                            <Input name="fontSize" type="number" defaultValue={selectedTemplate.namePosition.fontSize} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Font Family</Label>
                                            <select name="fontFamily" className="w-full p-2 border rounded-md" defaultValue={selectedTemplate.namePosition.fontFamily}>
                                                <option value="serif">Serif</option>
                                                <option value="sans-serif">Sans-serif</option>
                                                <option value="monospace">Monospace</option>
                                                <option value="cursive">Cursive</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Color</Label>
                                            <Input name="color" type="color" defaultValue={selectedTemplate.namePosition.color} className="h-10 w-full" />
                                        </div>

                                        <Button type="submit" className="w-full">
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Configuration
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Preview */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[400px] flex items-center justify-center">
                                        {selectedTemplate.imagePath ? (
                                            <div className="relative cursor-crosshair" onClick={handleImageClick}>
                                                <img
                                                    ref={imageRef}
                                                    src={selectedTemplate.imagePath}
                                                    alt="Certificate Template"
                                                    className="max-w-full h-auto"
                                                />
                                                <div
                                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
                                                    style={{
                                                        left: `${pos.x}%`,
                                                        top: `${pos.y}%`,
                                                        fontSize: `${selectedTemplate.namePosition.fontSize}px`,
                                                        fontFamily: selectedTemplate.namePosition.fontFamily,
                                                        color: selectedTemplate.namePosition.color,
                                                    }}
                                                >
                                                    John Doe
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>Upload a template image to start</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 text-center">
                                        Click anywhere on the image to position the name.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select or create a template to start editing.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
