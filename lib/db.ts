import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

export interface TemplateConfig {
    id: string
    name: string
    imagePath: string | null
    namePosition: {
        x: number
        y: number
        fontSize: number
        fontFamily: string
        color: string
    }
    signaturePosition: {
        x: number
        y: number
        visible: boolean
    }
}

export interface Certificate {
    code: string
    name: string
    templateId: string
    status: 'active' | 'revoked'
    generatedAt: string
}

export interface Database {
    templates: TemplateConfig[]
    certificates: Certificate[]
    failedAttempts: { code: string; timestamp: string }[]
}

const defaultTemplate: TemplateConfig = {
    id: 'default',
    name: 'Default Template',
    imagePath: null,
    namePosition: { x: 50, y: 50, fontSize: 30, fontFamily: 'serif', color: '#000000' },
    signaturePosition: { x: 50, y: 80, visible: false },
}

const defaultDb: Database = {
    templates: [defaultTemplate],
    certificates: [],
    failedAttempts: [],
}

export function getDb(): Database {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2))
        return defaultDb
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    try {
        const parsed = JSON.parse(data)

        // Migration logic: if 'template' exists (old schema), convert to 'templates' array
        if (parsed.template && !parsed.templates) {
            const migratedTemplate = { ...parsed.template, id: 'default', name: 'Default Template' }
            const migratedCertificates = Array.isArray(parsed.certificates)
                ? parsed.certificates.map((c: any) => ({ ...c, templateId: 'default' }))
                : []

            const migratedDb: Database = {
                templates: [migratedTemplate],
                certificates: migratedCertificates,
                failedAttempts: parsed.failedAttempts || []
            }
            saveDb(migratedDb) // Save immediately
            return migratedDb
        }

        return parsed
    } catch (error) {
        return defaultDb
    }
}

export function saveDb(data: Database) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export function getTemplates() {
    return getDb().templates
}

export function getTemplate(id: string) {
    return getDb().templates.find(t => t.id === id)
}

export function addTemplate(name: string) {
    const db = getDb()
    const newTemplate: TemplateConfig = {
        ...defaultTemplate,
        id: randomBytes(4).toString('hex'),
        name,
    }
    db.templates.push(newTemplate)
    saveDb(db)
    return newTemplate
}

export function updateTemplate(id: string, config: Partial<TemplateConfig>) {
    const db = getDb()
    const index = db.templates.findIndex(t => t.id === id)
    if (index !== -1) {
        db.templates[index] = { ...db.templates[index], ...config }
        saveDb(db)
        return db.templates[index]
    }
    return null
}

export function deleteTemplate(id: string) {
    const db = getDb()
    // Don't delete if it's the only one or if used by certificates (optional check, skipping for simplicity)
    if (db.templates.length <= 1) return false

    db.templates = db.templates.filter(t => t.id !== id)
    saveDb(db)
    return true
}

export function addCertificate(cert: Certificate) {
    const db = getDb()
    db.certificates.push(cert)
    saveDb(db)
    return cert
}

export function getCertificate(code: string) {
    const db = getDb()
    return db.certificates.find((c) => c.code === code)
}

export function deleteCertificate(code: string) {
    const db = getDb()
    const initialLength = db.certificates.length
    db.certificates = db.certificates.filter(c => c.code !== code)

    if (db.certificates.length !== initialLength) {
        saveDb(db)
        return true
    }
    return false
}

export function logFailedAttempt(code: string) {
    const db = getDb()
    db.failedAttempts.push({ code, timestamp: new Date().toISOString() })
    saveDb(db)

    const logPath = path.join(process.cwd(), 'data', 'failed_attempts.txt')
    const logEntry = `[${new Date().toISOString()}] Failed attempt for code: ${code}\n`
    fs.appendFileSync(logPath, logEntry)
}
