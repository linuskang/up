'use client';

// Libraries
import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    const [name, setName] = useState(session?.user?.name ?? '');
    const [image, setImage] = useState(session?.user?.image ?? '');

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name ?? '');
            setImage(session.user.image ?? '');
        }
    }, [session?.user?.name, session?.user?.image]);
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

            <Card className="bg-card ring-0">
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
                                                key={image}
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

            <Card className="bg-card ring-0">
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

            <Card className="bg-card ring-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">Account Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">

                        <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Free</p>
                                    <p className="text-xs text-muted-foreground">Perfect for small projects</p>
                                </div>
                                <Label className="px-2 py-1 bg-muted rounded-md text-muted-foreground">
                                    Current Plan
                                </Label>
                            </div>
                            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> 1 project
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> 50 events / day
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> 3 days data retention
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> 1 member
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Community support
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Pro ($29 / month)</p>
                                    <p className="text-xs text-muted-foreground">Advanced features for production apps</p>
                                </div>
                                <Button variant="default" size="sm">
                                    Upgrade
                                </Button>
                            </div>
                            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Unlimited projects
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> 10,000 events / day
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> 90 days data retention
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Analytics
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Bulk event export
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Event webhooks
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Unlimited members
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Project audit logs
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Email support
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Enterprise (Custom)</p>
                                    <p className="text-xs text-muted-foreground">Get a plan tailored to your needs</p>
                                </div>
                                <Button variant="default" size="sm">
                                    Contact Sales
                                </Button>
                            </div>
                            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Everything in Pro
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Unlimited projects
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Unlimited events / day
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Unlimited data retention
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Custom domain
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Custom integrations
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Dedicated infrastructure
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Priority support
                                </li>
                            </ul>
                        </div>

                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card ring-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" className="h-10 text-sm w-full cursor-pointer font-bold">
                        Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
