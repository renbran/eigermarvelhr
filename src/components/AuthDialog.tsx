import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { UserType } from '@/lib/types'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
  onSuccess: (userId: string, userType: UserType) => void
}

export function AuthDialog({ isOpen, onClose, mode, onSuccess }: AuthDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserType>('candidate')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'register') {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        await spark.kv.set(`user:${userId}`, {
          id: userId,
          email,
          userType,
          isPremium: false,
          createdAt: new Date().toISOString()
        })

        await spark.kv.set('currentUser', userId)
        
        toast.success('Account created successfully!')
        onSuccess(userId, userType)
      } else {
        const allKeys = await spark.kv.keys()
        const userKeys = allKeys.filter(key => key.startsWith('user:'))
        
        let foundUser = null
        for (const key of userKeys) {
          const user = await spark.kv.get<any>(key)
          if (user && user.email === email) {
            foundUser = user
            break
          }
        }

        if (foundUser) {
          await spark.kv.set('currentUser', foundUser.id)
          toast.success('Welcome back!')
          onSuccess(foundUser.id, foundUser.userType)
        } else {
          toast.error('Invalid credentials')
          setLoading(false)
          return
        }
      }

      onClose()
      setEmail('')
      setPassword('')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Sign in to access your dashboard' 
              : 'Join Eiger Marvel to find your next opportunity'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="userType">I am a</Label>
              <Select value={userType} onValueChange={(value) => setUserType(value as UserType)}>
                <SelectTrigger id="userType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate (Looking for jobs)</SelectItem>
                  <SelectItem value="employer">Employer (Hiring talent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    setTimeout(() => {
                      const registerBtn = document.querySelector('[data-auth="register"]') as HTMLButtonElement
                      registerBtn?.click()
                    }, 100)
                  }}
                  className="text-accent font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    setTimeout(() => {
                      const loginBtn = document.querySelector('[data-auth="login"]') as HTMLButtonElement
                      loginBtn?.click()
                    }, 100)
                  }}
                  className="text-accent font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
