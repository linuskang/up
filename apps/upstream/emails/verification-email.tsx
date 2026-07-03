import * as React from "react"
import { Text, Button, Link, Section } from "@react-email/components"
import { EmailLayout, heading, paragraph, button, link } from "./email-layout"

interface VerificationEmailProps {
  userName: string
  verificationUrl: string
}

export const VerificationEmail = ({
  userName,
  verificationUrl,
}: VerificationEmailProps) => (
  <EmailLayout preview="Verify your Upstream email address">
    <Text style={heading}>Welcome to Upstream</Text>
    <Text style={paragraph}>
      Hi {userName}, thanks for signing up. Please verify your email address to
      complete your account setup.
    </Text>
    <Text style={paragraph}>
      Click the button below to confirm your email. This link will expire in 1
      hour.
    </Text>

    <Section style={{ textAlign: "center", margin: "24px 0" }}>
      <Button href={verificationUrl} style={button}>
        Verify email
      </Button>
    </Section>

    <Text style={paragraph}>
      If the button doesn&apos;t work, you can copy and paste this link into
      your browser:
    </Text>
    <Text
      style={{
        ...paragraph,
        wordBreak: "break-all" as const,
        fontSize: "12px",
        color: "rgba(255,255,255,0.4)",
      }}
    >
      <Link href={verificationUrl} style={link}>
        {verificationUrl}
      </Link>
    </Text>

    <Text
      style={{
        ...paragraph,
        marginTop: "24px",
        fontSize: "13px",
        color: "rgba(255,255,255,0.45)",
      }}
    >
      If you didn&apos;t create an account with Upstream, you can safely ignore
      this email.
    </Text>
  </EmailLayout>
)

export default VerificationEmail
