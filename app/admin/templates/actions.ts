'use server'

import { updateTemplate, getTemplates, addTemplate, deleteTemplate } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function saveTemplateConfig(id: string, formData: FormData) {
    const x = Number(formData.get('x'))
    const y = Number(formData.get('y'))
    const fontSize = Number(formData.get('fontSize'))
    const fontFamily = formData.get('fontFamily') as string
    const color = formData.get('color') as string

    updateTemplate(id, {
        namePosition: {
            x,
            y,
            fontSize,
            fontFamily,
            color,
        }
    })

    revalidatePath('/admin/templates')
    return { success: true }
}

export async function createTemplate(formData: FormData) {
    const name = formData.get('name') as string
    if (!name) return { error: 'Name is required' }
    const template = addTemplate(name)
    revalidatePath('/admin/templates')
    return { success: true, template }
}

export async function removeTemplate(id: string) {
    const success = deleteTemplate(id)
    if (success) {
        revalidatePath('/admin/templates')
        return { success: true }
    }
    return { error: 'Cannot delete the last template' }
}

export async function getTemplatesList() {
    return getTemplates()
}
