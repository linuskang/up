import * as React from "react"
import { Text, Button, Link, Section } from "@react-email/components"
import { EmailLayout, heading, paragraph, button, link } from "./email-layout"

interface ResetPasswordEmailProps {
  userName: string
  resetUrl: string
}

export const ResetPasswordEmail = ({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) => (
  <EmailLayout preview="Reset your Upstream password">
    <Text style={heading}>Reset your password</Text>
    <Text style={paragraph}>
      Hi {userName}, we received a request to reset your password for your
      Upstream account.
    </Text>
    <Text style={paragraph}>
      If you made this request, click the button below to choose a new password.
      This link will expire in 1 hour.
    </Text>

    <Section style={{ textAlign: "center", margin: "24px 0" }}>
      <Button href={resetUrl} style={button}>
        Reset password
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
      <Link href={resetUrl} style={link}>
        {resetUrl}
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
      If you didn&apos;t request a password reset, you can safely ignore this
      email. Your password will not be changed.
    </Text>
  </EmailLayout>
)

export default ResetPasswordEmail
