import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuth } from '@/components/auth/AuthProvider'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', data)
      login(response.data)
      navigate('/', { replace: true })
      toast.success('Login successful')
    } catch (error: any) {
      const errData = error.response?.data?.error
      const errorMsg = typeof errData === 'string' 
        ? errData 
        : errData?.message || 'Failed to login'
      toast.error(errorMsg)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-border/50 bg-card rounded-3xl overflow-hidden">
        <CardHeader className="space-y-3 pb-6 pt-8 text-center">
          <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
            HAII LIAA
          </CardTitle>
          <CardDescription className="text-base">
            Login Dulu Bos
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="Enter your username"
                className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors"
                {...form.register('username')}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive font-medium">{form.formState.errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary transition-colors pr-10"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive font-medium">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium shadow-md transition-all active:scale-[0.98]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
