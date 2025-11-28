"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { GlobalNavbar } from "@/components/global-navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Bell, Shield, Palette, Download, Trash2, Mail, Lock, Camera } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { useUser } from "@/lib/user-context"
import { useJournal } from "@/lib/journal-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, updateUser, deleteAccount } = useUser()
  const { entries, streakData, badges, completedActivities } = useJournal()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || "Journal User")
  const [email, setEmail] = useState(user?.email || "user@example.com")
  const [avatar, setAvatar] = useState(user?.avatar || "")
  const [notifications, setNotifications] = useState(true)
  const [reminderTime, setReminderTime] = useState("20:00")
  const [pinCode, setPinCode] = useState("")
  const [pinEnabled, setPinEnabled] = useState(false)

  // Dialog states
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)

  // Email verification
  const [newEmail, setNewEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)

  // Password change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Avatar upload
  const [avatarUrl, setAvatarUrl] = useState("")

  const handleSaveProfile = () => {
    updateUser({ name, email: user?.email, avatar })
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handleSendVerificationEmail = () => {
    setVerificationSent(true)
    toast({
      title: "Verification email sent",
      description: `A verification code has been sent to ${newEmail}`,
    })
  }

  const handleVerifyAndChangeEmail = () => {
    if (verificationCode === "123456") {
      // In production, verify with backend
      updateUser({ email: newEmail })
      setShowVerificationDialog(false)
      setShowEmailDialog(false)
      setNewEmail("")
      setVerificationCode("")
      setVerificationSent(false)
      toast({
        title: "Email changed",
        description: "Your email has been updated successfully.",
      })
    } else {
      toast({
        title: "Invalid code",
        description: "The verification code is incorrect.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      })
      return
    }

    // In production, validate current password with backend
    if (currentPassword === "") {
      toast({
        title: "Current password required",
        description: "Please enter your current password.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    })
    setShowPasswordDialog(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleUploadAvatar = () => {
    if (!avatarUrl) {
      toast({
        title: "No image selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      })
    }
  }

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        setAvatarUrl(base64String)
        updateUser({ avatar: base64String })
        toast({
          title: "Avatar uploaded",
          description: "Your profile picture has been updated.",
        })
        setShowAvatarDialog(false)
        setAvatarUrl("")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExport = () => {
    try {
      // Prepare export data
      const exportData = {
        exportDate: new Date().toISOString(),
        userInfo: {
          name: user?.name || "Journal User",
          email: user?.email || "user@example.com",
        },
        stats: {
          totalEntries: entries.length,
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          averageMood: entries.length > 0 
            ? (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(2)
            : 0,
        },
        entries: entries.map((e) => ({
          id: e.id,
          date: e.createdAt,
          mood: e.mood,
          content: e.content,
          emotions: e.emotions,
          tags: e.tags,
          type: e.entryType,
          isArchived: e.isArchived,
        })),
        badges: badges.map((b) => ({
          name: b.name,
          unlockedAt: b.unlockedAt,
        })),
        activities: completedActivities,
      }

      // Generate JSON file
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `wellness-journal-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your journal data has been downloaded.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "Could not export your journal data.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = () => {
    deleteAccount()
    toast({
      title: "Account deleted",
      description: "Your account and all data have been permanently deleted.",
    })
    setShowDeleteDialog(false)
  }

  const handleSavePin = async () => {
    if (pinCode.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      })
      return
    }

    try {
      const endpoint = pinEnabled ? "/api/user/archive-pin" : "/api/user/archive-pin"
      const method = pinEnabled ? "POST" : "DELETE"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: pinEnabled ? JSON.stringify({ pin: pinCode }) : undefined,
      })

      if (response.ok) {
        toast({
          title: pinEnabled ? "PIN Set" : "PIN Removed",
          description: pinEnabled
            ? "Your archive PIN has been set successfully."
            : "Your archive PIN has been removed.",
        })
        setPinCode("")
      } else {
        toast({
          title: "Error",
          description: "Failed to save PIN settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving PIN:", error)
      toast({
        title: "Error",
        description: "Failed to save PIN settings.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavbar />
      <AppSidebar />
      <main className="md:ml-64 pb-20 md:pb-0 pt-14">
        <div className="container mx-auto p-6 space-y-6 max-w-2xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input id="email" type="email" value={email} disabled className="flex-1" />
                  <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <div className="flex gap-2">
                  <Input id="avatar" type="url" value={avatar} disabled className="flex-1" />
                  <Button variant="outline" onClick={() => setShowAvatarDialog(true)}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)} className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure reminders and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Reminder</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to journal every day</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              {notifications && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Protect your journal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>PIN Lock for Archive</Label>
                  <p className="text-sm text-muted-foreground">Require 4-digit PIN to access archive</p>
                </div>
                <Switch checked={pinEnabled} onCheckedChange={setPinEnabled} />
              </div>
              {pinEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="pin">4-Digit PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="Enter 4-digit PIN"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                  <Button onClick={handleSavePin} className="w-full">
                    Save PIN
                  </Button>
                </div>
              )}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">End-to-end encryption:</span> Your journal entries are
                  encrypted and only accessible by you.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-4" />
                Data Management
              </CardTitle>
              <CardDescription>Export or delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Entries
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />

      {/* Email Change Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>Enter your new email address. A verification code will be sent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="your-new-email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => { handleSendVerificationEmail(); setShowVerificationDialog(true); }}>
              Send Verification Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Email</DialogTitle>
            <DialogDescription>Enter the verification code sent to {newEmail}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyAndChangeEmail}>Verify & Change Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current and new password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Avatar Upload Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Avatar</DialogTitle>
            <DialogDescription>Select an image file for your profile picture.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="avatar-file">Select Image File</Label>
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>

            {/* Preview */}
            {avatarUrl && (
              <div className="flex justify-center">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="h-24 w-24 rounded-full object-cover"
                  onError={() => {
                    toast({
                      title: "Image failed to load",
                      description: "Please check the image and try again.",
                      variant: "destructive",
                    })
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadAvatar} disabled={!avatarUrl}>
              Save Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data including journals, doodles, and preferences will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
