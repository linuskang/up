import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Font,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Html>
    <Head>
      <Font
        fontFamily="Geist"
        fallbackFontFamily={["Verdana", "Arial", "sans-serif"]}
        webFont={{
          url: 'https://fonts.gstatic.com/s/geist/v1/gyByhwUxId8g8_TlmXgCdGHS.ttf',
          format: 'truetype',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Geist"
        fallbackFontFamily={["Verdana", "Arial", "sans-serif"]}
        webFont={{
          url: 'https://fonts.gstatic.com/s/geist/v1/gyByhwUxId8g8_TlmXgCdGHS.ttf',
          format: 'truetype',
        }}
        fontWeight={700}
        fontStyle="normal"
      />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Section style={header}>
            <Text style={logo}>Upstream</Text>
          </Section>
          <Section style={content}>{children}</Section>
        </Section>
        <Text style={footer}>
          Sent by Upstream.           If you didn&apos;t request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#111111',
  color: '#f5f5f5',
  fontFamily: 'Geist, Verdana, Arial, sans-serif',
  padding: '40px 0',
};

const container = {
  maxWidth: '480px',
  margin: '0 auto',
};

const card = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.08)',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#1a1a1a',
  padding: '32px 32px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const logo = {
  color: '#f5f5f5',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '1.2',
};

const content = {
  padding: '24px 32px 32px',
};

const footer = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '24px',
  lineHeight: '1.5',
};

export const heading = {
  color: '#f5f5f5',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
  lineHeight: '1.3',
};

export const paragraph = {
  color: 'rgba(255,255,255,0.65)',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

export const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  width: 'fit-content',
  margin: '0 auto 20px',
};

export const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
  fontSize: '14px',
};

export const hr = {
  borderColor: 'rgba(255,255,255,0.08)',
  margin: '20px 0',
};
