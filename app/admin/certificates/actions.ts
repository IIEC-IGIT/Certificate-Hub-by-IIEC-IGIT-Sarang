'use server'

import { addCertificate, getDb, Certificate, deleteCertificate } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function generateCertificate(formData: FormData) {
    const namesInput = formData.get('name') as string
    const templateId = formData.get('templateId') as string
    if (!namesInput) return { error: 'Name is required' }
    if (!templateId) return { error: 'Template is required' }

    const names = namesInput.split('\n').map(n => n.trim()).filter(n => n.length > 0)

    if (names.length === 0) return { error: 'No valid names found' }

    const codes: string[] = []

    for (const name of names) {
        // Generate a unique 8-character code
        const code = randomBytes(4).toString('hex').toUpperCase()

        const cert: Certificate = {
            code,
            name,
            templateId,
            status: 'active',
            generatedAt: new Date().toISOString(),
        }

        addCertificate(cert)
        codes.push(code)
    }

    revalidatePath('/admin/certificates')
    revalidatePath('/admin/dashboard')
    return { success: true, count: codes.length, codes }
}

export async function getTemplatesList() {
    const db = getDb()
    return db.templates
}

export async function getCertificates() {
    const db = getDb()
    return db.certificates
}

export async function removeCertificate(code: string) {
    const success = deleteCertificate(code)
    if (success) {
        revalidatePath('/admin/certificates')
        revalidatePath('/admin/dashboard')
        return { success: true }
    }
    return { error: 'Certificate not found' }
}

export async function getStats() {
    const db = getDb()
    const total = db.certificates.length
    const active = db.certificates.filter(c => c.status === 'active').length
    const failed = db.failedAttempts.length
    return { total, active, failed }
}
