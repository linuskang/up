"use client"

// Libraries
import { authClient } from "@/client/auth"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

// Components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function Page() {
    const { data: session } = authClient.useSession()

    // Fields
    const [newPassword, setNewPassword] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [revokeSessions, setRevokeSessions] = useState(false)

    // State
    const [isSaving, setIsSaving] = useState(false)

    if (!session) {
        return null
    }

    const update = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const { error } = await authClient.changePassword({
            currentPassword: currentPassword,
            newPassword: newPassword,
            revokeOtherSessions: revokeSessions,
        })

        if (error) {
            toast.error("Failed to update password.")
            setIsSaving(false)
            return
        }

        toast.success("Password updated successfully.")
        setIsSaving(false)
    }

    return (
        <div className="flex min-h-svh flex-col gap-3 py-6">
            <div className="flex flex-col gap-1">
                <Breadcrumb>
                    <BreadcrumbList className="text-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/settings">Settings</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Security</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Card className="bg-card ring-0">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white">
                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        id="profile-form"
                        onSubmit={update}
                        className="space-y-3"
                    >
                        <div>
                            <Label htmlFor="current-password" className="mb-2">
                                Current Password
                            </Label>
                            <Input
                                id="current-password"
                                value={currentPassword}
                                placeholder="Enter current password"
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                className="border-0 bg-input text-white"
                                type="password"
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-password" className="mb-2">
                                New Password
                            </Label>
                            <Input
                                id="new-password"
                                value={newPassword}
                                placeholder="Enter new password"
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="border-0 bg-input text-white"
                                type="password"
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="revoke-sessions"
                                className="mb-2 block"
                            >
                                Revoke Other Sessions
                            </Label>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="revoke-sessions"
                                    checked={revokeSessions}
                                    onCheckedChange={(checked) =>
                                        setRevokeSessions(checked === true)
                                    }
                                />
                                <span className="text-sm text-muted-foreground">
                                    Sign out of other sessions
                                </span>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="justify-end">
                    <Button
                        size="sm"
                        type="submit"
                        form="profile-form"
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
