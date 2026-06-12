"use client"

// Libraries
import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/client/auth"
import { redirect } from "next/navigation"

// Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Github, Google } from "@/components/icons"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export default function Page() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agree, setAgree] = useState(false)

  const signUp = async (form: React.FormEvent<HTMLFormElement>) => {
    form.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    })

    if (error) {
      setError(error.message || "An error occured")
      setLoading(false)
      return
    } else {
      toast.success(
        "Account created successfully! Please check your email to verify your account."
      )
      redirect("/login")
      setLoading(false)
    }
  }

  const github = async () => {
    setError(null)
    setLoading(true)

    await authClient.signIn.social({
      provider: "github",
    })
  }

  const google = async () => {
    setError(null)
    setLoading(true)

    await authClient.signIn.social({
      provider: "google",
    })
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <Card className="bg-background ring-0">
        <CardHeader className="gap-2 pb-2 text-center">
          <CardTitle className="text-5xl font-bold">Upstream</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex min-w-90 flex-col gap-5" onSubmit={signUp}>
            <Field>
              <Button
                variant="outline"
                type="button"
                onClick={github}
                disabled={loading}
                className="h-10 w-full cursor-pointer justify-center gap-2 border-none text-sm"
              >
                <Github />
                Register with GitHub
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={google}
                disabled={loading}
                className="h-10 w-full cursor-pointer justify-center gap-2 border-none text-sm"
              >
                <Google />
                Register with Google
              </Button>
            </Field>
            <FieldSeparator className="text-sm">
              Or register with
            </FieldSeparator>
            <Field className="-mt-2">
              <FieldGroup>
                <FieldLabel className="text-sm">Your Name</FieldLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  placeholder="Your Name"
                  className="-mt-3 h-10 border-0 !text-sm text-xl ring-primary"
                />
              </FieldGroup>
            </Field>
            <Field className="-mt-2">
              <FieldGroup>
                <FieldLabel className="text-sm">Account Email</FieldLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  className="-mt-3 h-10 border-0 !text-sm text-xl"
                />
              </FieldGroup>
            </Field>
            <Field className="-mt-2">
              <FieldGroup>
                <FieldLabel className="text-sm">Your Password</FieldLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="-mt-3 h-10 border-0 !text-sm text-base"
                />
              </FieldGroup>
            </Field>
            <Field className="-mt-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={agree}
                  onCheckedChange={(checked) => setAgree(checked === true)}
                  disabled={loading}
                  aria-label="I agree to the Terms of Service"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-semibold transition hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </span>
              </label>
            </Field>
            <Field>
              <Button
                type="submit"
                disabled={loading || !agree}
                className="h-10 w-full cursor-pointer text-sm font-bold"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              {error && (
                <div className="flex justify-center rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}
            </Field>
            <FieldDescription className="flex justify-center text-sm">
              Have an account?{" "}
              <Link
                href="/login"
                className="underline-none ml-1 font-bold !no-underline transition hover:text-white"
              >
                Login
              </Link>
            </FieldDescription>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
