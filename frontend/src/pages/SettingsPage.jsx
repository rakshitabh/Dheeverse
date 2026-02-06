import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Palette,
  Bell,
  Lock,
  Download,
  Trash2,
  Mail,
  Eye,
  EyeOff,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import { useUser } from "../lib/user-context";
import { useTheme } from "../lib/theme-context";
import { userAPI, notificationsAPI } from "../lib/api";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Separator } from "../components/ui/separator";

export default function SettingsPage() {
  const {
    user,
    updateUser,
    logout,
    deleteAccount: deleteUserAccount,
  } = useUser();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Profile state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Email change state (OTP-based)
  const [newEmail, setNewEmail] = useState("");
  const [emailOTP, setEmailOTP] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    theme: "light",
    notifications: {
      enabled: true,
      reminders: true,
      weeklySummary: false,
      scheduledReminders: false,
      reminderTime: "21:30",
    },
  });
  const [hasArchivePassword, setHasArchivePassword] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [notificationSettingsChanged, setNotificationSettingsChanged] =
    useState(false);
  const [originalNotificationSettings, setOriginalNotificationSettings] =
    useState(null);

  // Archive password state
  const [archivePassword, setArchivePassword] = useState("");
  const [confirmArchivePassword, setConfirmArchivePassword] = useState("");
  const [archivePasswordLoading, setArchivePasswordLoading] = useState(false);
  const [showArchivePasswordForm, setShowArchivePasswordForm] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await userAPI.getProfile();
      if (data.user) {
        setName(data.user.name || "");
        setUsername(data.user.username || "");
        updateUser(data.user);
      }
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const loadSettings = async () => {
    try {
      const data = await userAPI.getSettings();
      if (data.settings) {
        const notificationSettings = {
          enabled: data.settings.notifications?.enabled ?? true,
          reminders: data.settings.notifications?.reminders ?? true,
          weeklySummary: data.settings.notifications?.weeklySummary ?? false,
          scheduledReminders:
            data.settings.notifications?.scheduledReminders ?? false,
          reminderTime: data.settings.notifications?.reminderTime || "21:30",
        };
        setSettings({
          theme: data.settings.theme || "light",
          notifications: notificationSettings,
        });
        setOriginalNotificationSettings(notificationSettings);
        setHasArchivePassword(data.hasArchivePassword || false);
        // Update theme context
        if (data.settings.theme) {
          setTheme(data.settings.theme);
        }
      }
    } catch (error) {
      toast.error("Failed to load settings");
    }
  };

  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await userAPI.updateProfile({ name, username });
      updateUser(data.user);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRequestEmailOTP = async () => {
    if (!newEmail) {
      toast.error("Please enter a new email address");
      return;
    }
    setEmailLoading(true);
    try {
      await userAPI.requestEmailChange(newEmail);
      setOtpSent(true);
      toast.success("OTP sent to new email");
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!newEmail || !emailOTP) {
      toast.error("Enter the OTP sent to your new email");
      return;
    }
    setEmailLoading(true);
    try {
      const data = await userAPI.verifyEmailChange(newEmail, emailOTP);
      updateUser(data.user);
      toast.success("Email updated successfully");
      setShowEmailForm(false);
      setOtpSent(false);
      setNewEmail("");
      setEmailOTP("");
    } catch (error) {
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      await userAPI.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = (updates) => {
    const newNotifications = { ...settings.notifications, ...updates };
    setSettings({ ...settings, notifications: newNotifications });
    setNotificationSettingsChanged(true);
  };

  const handleSaveNotificationSettings = async () => {
    setSettingsLoading(true);
    try {
      const newSettings = { ...settings };
      await userAPI.updateSettings(newSettings);
      setOriginalNotificationSettings(settings.notifications);
      setNotificationSettingsChanged(false);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save notification settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleUpdateSettings = async (updates) => {
    setSettingsLoading(true);
    try {
      const newSettings = { ...settings, ...updates };
      await userAPI.updateSettings(newSettings);
      setSettings(newSettings);

      // Update theme if changed
      if (updates.theme) {
        setTheme(updates.theme);
      }

      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSetArchivePassword = async () => {
    if (!archivePassword || !confirmArchivePassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (archivePassword.length < 4) {
      toast.error("Archive password must be at least 4 characters");
      return;
    }

    if (archivePassword !== confirmArchivePassword) {
      toast.error("Passwords do not match");
      return;
    }

    setArchivePasswordLoading(true);
    try {
      await userAPI.setArchivePassword(archivePassword);
      toast.success("Archive password set successfully");
      setHasArchivePassword(true);
      setShowArchivePasswordForm(false);
      setArchivePassword("");
      setConfirmArchivePassword("");
    } catch (error) {
      toast.error(error.message || "Failed to set archive password");
    } finally {
      setArchivePasswordLoading(false);
    }
  };

  const handleRemoveArchivePassword = async () => {
    setArchivePasswordLoading(true);
    try {
      await userAPI.removeArchivePassword();
      toast.success("Archive password removed successfully");
      setHasArchivePassword(false);
    } catch (error) {
      toast.error(error.message || "Failed to remove archive password");
    } finally {
      setArchivePasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      await userAPI.exportData();
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error(error.message || "Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setDeleteLoading(true);
    try {
      await userAPI.deleteAccount(deletePassword);

      // Clear all user data
      deleteUserAccount();
      logout();

      toast.success("Account deleted successfully", {
        description: "Your account has been permanently deleted.",
      });

      // Redirect to landing page after account deletion
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>
              <Button onClick={handleUpdateProfile} disabled={profileLoading}>
                <Save className="w-4 h-4 mr-2" />
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>Change your email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Email</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="opacity-60"
                />
              </div>
              {!showEmailForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowEmailForm(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Change Email
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                    />
                  </div>
                  {otpSent && (
                    <div className="space-y-2">
                      <Label htmlFor="emailOTP">Enter OTP</Label>
                      <Input
                        id="emailOTP"
                        type="text"
                        value={emailOTP}
                        onChange={(e) => setEmailOTP(e.target.value)}
                        placeholder="Enter the 6-digit OTP"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    {!otpSent ? (
                      <Button onClick={handleRequestEmailOTP} disabled={emailLoading}>
                        {emailLoading ? "Sending..." : "Send OTP"}
                      </Button>
                    ) : (
                      <Button onClick={handleVerifyEmailOTP} disabled={emailLoading}>
                        {emailLoading ? "Verifying..." : "Verify & Update Email"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEmailForm(false);
                        setNewEmail("");
                        setEmailOTP("");
                        setOtpSent(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {["light", "dark"].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => handleUpdateSettings({ theme: themeOption })}
                    className={`p-4 rounded-lg border-2 transition ${
                      settings.theme === themeOption
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-sm font-medium capitalize mb-2">
                      {themeOption}
                    </div>
                    <div
                      className={`h-12 rounded ${
                        themeOption === "light"
                          ? "bg-white border"
                          : "bg-gray-900"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn notifications on or off
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationChange({ enabled: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily journal reminders
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.reminders}
                  disabled={!settings.notifications.enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationChange({ reminders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Summary Notification</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary of your journal entries
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklySummary}
                  disabled={!settings.notifications.enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationChange({ weeklySummary: checked })
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Scheduled Time-Based Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminder at a specific time each day
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.scheduledReminders}
                    disabled={!settings.notifications.enabled}
                    onCheckedChange={(checked) =>
                      handleNotificationChange({ scheduledReminders: checked })
                    }
                  />
                </div>
                {settings.notifications.scheduledReminders && (
                  <div className="pl-0 space-y-2">
                    <Label htmlFor="reminderTime">Reminder Time</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={settings.notifications.reminderTime || "21:30"}
                      disabled={
                        !settings.notifications.enabled ||
                        !settings.notifications.scheduledReminders
                      }
                      onChange={(e) =>
                        handleNotificationChange({
                          reminderTime: e.target.value,
                        })
                      }
                      className="max-w-[200px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      You will receive an email reminder at {" "}
                      {settings.notifications.reminderTime || "21:30"} daily at
                      your registered email address
                    </p>
                  </div>
                )}
              </div>
              {notificationSettingsChanged && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveNotificationSettings}
                    disabled={settingsLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {settingsLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Archive Password</CardTitle>
              <CardDescription>
                Set a password to protect archived entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasArchivePassword ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Archive password is set
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleRemoveArchivePassword}
                    disabled={archivePasswordLoading}
                  >
                    {archivePasswordLoading
                      ? "Removing..."
                      : "Remove Archive Password"}
                  </Button>
                </div>
              ) : (
                <>
                  {!showArchivePasswordForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowArchivePasswordForm(true)}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Set Archive Password
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="archivePassword">
                          Archive Password
                        </Label>
                        <Input
                          id="archivePassword"
                          type="password"
                          value={archivePassword}
                          onChange={(e) => setArchivePassword(e.target.value)}
                          placeholder="Enter archive password (min. 4 characters)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmArchivePassword">
                          Confirm Archive Password
                        </Label>
                        <Input
                          id="confirmArchivePassword"
                          type="password"
                          value={confirmArchivePassword}
                          onChange={(e) =>
                            setConfirmArchivePassword(e.target.value)
                          }
                          placeholder="Confirm archive password"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSetArchivePassword}
                          disabled={archivePasswordLoading}
                        >
                          {archivePasswordLoading
                            ? "Setting..."
                            : "Set Password"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowArchivePasswordForm(false);
                            setArchivePassword("");
                            setConfirmArchivePassword("");
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      Warning
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. All your journal entries,
                      settings, and data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all
                      associated data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="deletePassword">
                        Enter your password to confirm
                      </Label>
                      <Input
                        id="deletePassword"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword || deleteLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteLoading ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
