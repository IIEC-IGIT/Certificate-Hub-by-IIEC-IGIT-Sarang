'use client'

import { useActionState } from 'react'
import { verifyCode } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShieldCheck } from 'lucide-react'

export default function Home() {
  const [state, formAction, isPending] = useActionState(verifyCode, null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl">
            <ShieldCheck className="w-16 h-16 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Certificate Hub
          </h1>
          <p className="text-xl font-medium text-emerald-400">by IIEC IGIT Sarang</p>
          <p className="text-lg text-gray-300 max-w-lg mx-auto">
            Verify the authenticity of your certificate by entering the unique code provided.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
          <form action={formAction} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                name="code"
                placeholder="Enter Certificate Code (e.g. A1B2C3D4)"
                className="h-12 text-lg bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-emerald-500"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
            >
              {isPending ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
          {state?.error && (
            <p className="mt-4 text-red-400 bg-red-900/20 py-2 px-4 rounded-lg inline-block">
              {state.error}
            </p>
          )}
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} All rights reserved by IIEC IGIT Sarang.</p>
        </div>
      </div>
    </div>
  )
}
