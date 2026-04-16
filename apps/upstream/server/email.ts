import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendProjectInviteEmail({
    to,
    inviterName,
    projectName,
    role,
    inviteUrl,
}: {
    to: string;
    inviterName: string;
    projectName: string;
    role: string;
    inviteUrl: string;
}) {
    return resend.emails.send({
        from: env.RESEND_EMAIL_FROM,
        to,
        subject: `[Upstream] ${inviterName} invited you to ${projectName}`,
        text: [
            `${inviterName} has invited you to join the project "${projectName}" on Upstream as ${role}.`,
            "",
            `Accept the invitation here: ${inviteUrl}`,
            "",
            `This invitation expires in 7 days.`,
            "",
            `If you did not expect this invitation, you can safely ignore this email.`,
        ].join("\n"),
    });
}
