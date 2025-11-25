import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { updateTemplate } from '@/lib/db'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/uploads
    const filename = `template-${Date.now()}${path.extname(file.name)}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const filepath = path.join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)

        // Update DB with new image path
        const publicPath = `/uploads/${filename}`
        const templateId = data.get('templateId') as string
        if (templateId) {
            updateTemplate(templateId, { imagePath: publicPath })
        }

        return NextResponse.json({ success: true, path: publicPath })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
    }
}
