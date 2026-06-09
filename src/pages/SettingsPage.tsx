import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, KeyRound, Activity, User, LogOut, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'
import { profileService } from '@/services/profileService'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user, profile, logout, refreshProfile } = useAuth()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (error) throw error

      toast.success('Password changed successfully')
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploadingAvatar(true)
    const toastId = toast.loading('Mengunggah foto profil...')

    try {
      await profileService.uploadAvatar(file, user.id)
      await refreshProfile()
      toast.success('Foto profil berhasil diperbarui', { id: toastId })
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunggah foto', { id: toastId })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const fallbackName = user?.email ? user.email.split('@')[0] : 'User'
  const displayName = profile?.full_name || profile?.username || user?.user_metadata?.full_name || fallbackName

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2">Account</h2>
        
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-3xl uppercase shadow-sm border border-primary/20 overflow-hidden relative">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={displayName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(displayName).charAt(0)}</span>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  title="Ubah Foto Profil"
                >
                  <Camera size={14} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground text-lg">{displayName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  {...form.register('oldPassword')}
                />
                {form.formState.errors.oldPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.oldPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...form.register('newPassword')}
                />
                {form.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register('confirmPassword')}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="mt-4"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mobile Logout Button - hidden on md and above */}
        <div className="md:hidden pt-2">
          <Button
            variant="destructive"
            className="w-full py-6 text-base font-medium rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-semibold tracking-tight border-b pb-2">System</h2>
        <Card className="shadow-sm border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Log Aktivitas</CardTitle>
                <CardDescription>Lihat riwayat aktivitas dan jejak audit sistem</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild variant="outline" className="w-full justify-between group">
              <Link to="/settings/activity">
                Buka Log Aktivitas
                <Activity className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
