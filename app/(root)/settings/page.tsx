'use client';

// Libraries
import { useState } from 'react';
import { authClient } from '@/client/auth';
import { redirect } from 'next/navigation';

// Components
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Field,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { toast } from 'sonner';

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    const [name, setName] = useState(session?.user?.name ?? '');
    const [image, setImage] = useState(session?.user?.image ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    if (isPending) {
        return (
            <div className="flex min-h-svh items-center justify-center p-6">
                <div>Loading...</div>
            </div>
        );
    }

    if (!session) {
        redirect('/login');
    }

    const updateProfile = async (form: React.FormEvent<HTMLFormElement>) => {
        form.preventDefault();
        setProfileError(null);
        setProfileLoading(true);

        const { error } = await authClient.updateUser({
            name,
            image,
        });

        if (error) {
            setProfileError(error.message || 'An error occurred');
            setProfileLoading(false);
            return;
        }

        toast.success('Profile updated successfully');
        setProfileLoading(false);
    }

    const changePassword = async (form: React.FormEvent<HTMLFormElement>) => {
        form.preventDefault();
        setPasswordError(null);

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            return;
        }

        setPasswordLoading(true);

        const { error } = await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        });

        if (error) {
            setPasswordError(error.message || 'An error occurred');
            setPasswordLoading(false);
            return;
        }

        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordLoading(false);
    }

    return (
        <div className="flex min-h-svh flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">Account Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account details and security.</p>
            </div>

            <Card className="bg-background ring-1 ring-foreground/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4" onSubmit={updateProfile}>
                        <Field>
                            <FieldGroup>
                                <FieldLabel className="text-sm">Name</FieldLabel>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                    required
                                    placeholder="Your name"
                                    className="h-10 text-base border-0 !text-sm"
                                />
                            </FieldGroup>
                        </Field>
                        <Field>
                            <FieldGroup>
                                <FieldLabel className="text-sm">Image URL</FieldLabel>
                                <Input
                                    type="url"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="https://example.com/avatar.png"
                                    className="h-10 text-base border-0 !text-sm"
                                />
                                {image && (
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="relative size-12 overflow-hidden rounded-md border border-border/60 bg-secondary">
                                            <img
                                                src={image}
                                                alt="Avatar preview"
                                                className="size-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Preview</span>
                                    </div>
                                )}
                            </FieldGroup>
                        </Field>
                        <Field>
                            <FieldGroup>
                                <FieldLabel className="text-sm">Email</FieldLabel>
                                <Input
                                    type="email"
                                    value={session.user.email}
                                    disabled
                                    className="h-10 text-base border-0 !text-sm opacity-50"
                                />
                            </FieldGroup>
                        </Field>
                        <Field>
                            <Button type="submit" disabled={profileLoading} className="h-10 text-sm w-full cursor-pointer font-bold">
                                {profileLoading ? 'Saving...' : 'Save changes'}
                            </Button>
                            {profileError && (
                                <div className="flex justify-center rounded-lg text-sm text-destructive">
                                    {profileError}
                                </div>
                            )}
                        </Field>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-background ring-1 ring-foreground/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4" onSubmit={changePassword}>
                        <Field>
                            <FieldGroup>
                                <FieldLabel className="text-sm">Current Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    placeholder="Enter current password"
                                    className="h-10 text-base border-0 !text-sm"
                                />
                            </FieldGroup>
                        </Field>
                        <Field>
                            <FieldGroup>
                                <FieldLabel className="text-sm">New Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    placeholder="Enter new password"
                                    className="h-10 text-base border-0 !text-sm"
                                />
                            </FieldGroup>
                        </Field>
                        <Field>
                            <FieldGroup>
                                <FieldLabel className="text-sm">Confirm New Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    placeholder="Confirm new password"
                                    className="h-10 text-base border-0 !text-sm"
                                />
                            </FieldGroup>
                        </Field>
                        <Field>
                            <Button type="submit" disabled={passwordLoading} className="h-10 text-sm w-full cursor-pointer font-bold">
                                {passwordLoading ? 'Changing...' : 'Change password'}
                            </Button>
                            {passwordError && (
                                <div className="flex justify-center rounded-lg text-sm text-destructive">
                                    {passwordError}
                                </div>
                            )}
                        </Field>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
