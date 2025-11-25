'use server'

import { getCertificate, logFailedAttempt, getTemplate } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function verifyCode(prevState: any, formData: FormData) {
    const code = formData.get('code') as string
    if (!code) return { error: 'Please enter a code' }

    const cert = getCertificate(code.toUpperCase())

    if (cert) {
        redirect(`/verify/${code.toUpperCase()}`)
    } else {
        logFailedAttempt(code)
        return { error: 'Invalid code. Please check and try again.' }
    }
}

export async function getCertificateData(code: string) {
    const cert = getCertificate(code)
    if (!cert) return null

    const template = getTemplate(cert.templateId || 'default') || getTemplate('default')
    return { cert, template }
}
