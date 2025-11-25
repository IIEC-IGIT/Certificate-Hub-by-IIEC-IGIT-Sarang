'use client'

import { useActionState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

// Simple UI components to avoid full shadcn installation overhead for now, 
// but structured to be easily replaced or we can add them to components/ui if needed.
// Actually, I should create the basic UI components first or inline them for speed if they are simple.
// I'll assume I can use standard HTML/Tailwind for now or quickly scaffold the UI components.
// To make it "premium", I'll use raw Tailwind classes here for the specific components if the files don't exist.
// Wait, I created components/ui but it's empty. I should probably create the Button/Input/Card components or just code them inline for this specific page to save time, 
// but reusable components are better. I'll stick to inline Tailwind for the specific page to be fast, 
// or better, create a simple reusable set. 
// Let's do inline for the page to get it working, then refactor if needed.

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-full">
                                <Lock className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-white mb-2">Admin Access</h2>
                        <p className="text-center text-gray-400 mb-8">Enter your credentials to continue</p>

                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="userId" className="text-sm font-medium text-gray-300">User ID</label>
                                <input
                                    id="userId"
                                    name="userId"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                                    placeholder="Enter User ID"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                                    placeholder="Enter Password"
                                />
                            </div>

                            {state?.error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                    {state.error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? 'Authenticating...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
