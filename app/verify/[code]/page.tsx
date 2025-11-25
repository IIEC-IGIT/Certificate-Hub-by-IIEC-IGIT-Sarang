'use client'

import { useEffect, useState, useRef } from 'react'
import { getCertificateData } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'

export default function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const certRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        params.then(({ code }) => {
            getCertificateData(code).then((res) => {
                setData(res)
                setLoading(false)
            })
        })
    }, [params])

    const handleDownload = async () => {
        if (!certRef.current) return
        setDownloading(true)

        try {
            const canvas = await html2canvas(certRef.current, {
                useCORS: true,
                scale: 2, // Higher resolution
                backgroundColor: null,
            })

            const link = document.createElement('a')
            link.download = `Certificate-${data.cert.code}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
        } catch (err) {
            console.error('Download failed', err)
            alert('Failed to download certificate. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-700 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    if (!data || !data.cert) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
                    <Link href="/" className="text-blue-400 hover:underline">Go back</Link>
                </div>
            </div>
        )
    }

    const { cert, template } = data

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-8">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Verification
                    </Link>
                    <div className="flex items-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Verified Authentic</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificate of Achievement</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Issued to <span className="font-semibold text-gray-900 dark:text-white">{cert.name}</span></p>
                        </div>
                        <Button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            {downloading ? (
                                'Generating...'
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Certificate
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex justify-center overflow-auto">
                        {/* Certificate Container for Capture */}
                        <div
                            ref={certRef}
                            className="relative shadow-2xl"
                            style={{
                                width: '800px', // Fixed width for consistency
                                // height: 'auto' // Let image define height
                            }}
                        >
                            {template.imagePath ? (
                                <>
                                    <img
                                        src={template.imagePath}
                                        alt="Certificate Template"
                                        className="w-full h-auto block"
                                        crossOrigin="anonymous" // Important for html2canvas
                                    />
                                    <div
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center"
                                        style={{
                                            left: `${template.namePosition.x}%`,
                                            top: `${template.namePosition.y}%`,
                                            fontSize: `${template.namePosition.fontSize}px`,
                                            fontFamily: template.namePosition.fontFamily,
                                            color: template.namePosition.color,
                                            width: '100%', // Ensure centering works if text is long
                                        }}
                                    >
                                        {cert.name}
                                    </div>
                                </>
                            ) : (
                                <div className="w-[800px] h-[600px] bg-white flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <p className="text-gray-400">No template configured</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700">
                        Certificate ID: {cert.code} • Generated on {new Date(cert.generatedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    )
}
