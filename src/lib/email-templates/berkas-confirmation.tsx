import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "Kejar Prestasi";
const SITE_TAGLINE = "Beasiswa Section #3";

interface BerkasConfirmationProps {
  fullName?: string;
  token?: string;
  kind?: "prestasi" | "ekonomi" | string;
  count?: number;
  logoUrl?: string;
}

const kindLabel = (k?: string) =>
  k === "prestasi"
    ? "Beasiswa Prestasi"
    : k === "ekonomi"
      ? "Beasiswa Ekonomi"
      : "Beasiswa";

const BerkasConfirmationEmail = ({
  fullName,
  token,
  kind,
  count,
  logoUrl,
}: BerkasConfirmationProps) => (
  <Html lang="id" dir="ltr">
    <Head />
    <Preview>Berkas {kindLabel(kind)} Anda berhasil diterima</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          {logoUrl ? (
            <Img src={logoUrl} alt={SITE_NAME} width="72" height="72" style={logo} />
          ) : null}
          <Heading style={brand}>{SITE_NAME}</Heading>
          <Text style={brandSub}>{SITE_TAGLINE}</Text>
        </Section>

        <Section style={card}>
          <Section style={badge}>
            <Text style={badgeText}>✓ BERKAS DITERIMA</Text>
          </Section>

          <Heading style={h1}>
            {fullName ? `Terima kasih, ${fullName}!` : "Terima kasih!"}
          </Heading>
          <Text style={text}>
            Pengiriman berkas pendukung untuk <strong>{kindLabel(kind)}</strong>{" "}
            telah berhasil kami terima.
          </Text>

          <Section style={infoBox}>
            <Text style={infoRow}>
              <span style={infoLabel}>Kode Pendaftar</span>
              <span style={infoValue}>{token ?? "-"}</span>
            </Text>
            <Hr style={infoDivider} />
            <Text style={infoRow}>
              <span style={infoLabel}>Status</span>
              <span style={infoValueAccent}>Menunggu Verifikasi</span>
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Apa Selanjutnya?</Heading>
          <Text style={text}>
            Tim verifikasi kami akan meninjau setiap dokumen yang Anda kirim.
            Pastikan semua tautan berkas dapat diakses (izin “Siapa saja
            dengan link”). Jika ada kendala, kami akan menghubungi Anda
            melalui WhatsApp.
          </Text>
          <Text style={text}>
            Hasil seleksi akan diumumkan melalui email dan WhatsApp. Mohon
            ditunggu.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Email ini dikirim otomatis. Jangan balas email ini.
          </Text>
          <Text style={footerBrand}>
            © {new Date().getFullYear()} {SITE_NAME} — {SITE_TAGLINE}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: BerkasConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Berkas ${kindLabel(data?.kind)} Berhasil Diterima`,
  displayName: "Konfirmasi Pengiriman Berkas",
  previewData: {
    fullName: "Andi Pratama",
    token: "KP-PRE-A1B2C3",
    kind: "prestasi",
    count: 5,
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};
const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "32px 16px",
};
const header = {
  textAlign: "center" as const,
  paddingBottom: "24px",
};
const logo = {
  display: "block",
  margin: "0 auto 12px",
  borderRadius: "50%",
  objectFit: "cover" as const,
};
const brand = {
  fontSize: "26px",
  fontWeight: 800,
  color: "#5B2A9E",
  margin: 0,
  letterSpacing: "-0.5px",
};
const brandSub = {
  fontSize: "12px",
  color: "#7c7c87",
  margin: "4px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};
const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #ece9f5",
  borderRadius: "16px",
  padding: "32px 28px",
  boxShadow: "0 4px 12px rgba(91, 42, 158, 0.06)",
};
const badge = {
  display: "inline-block",
  backgroundColor: "#e8f5ed",
  borderRadius: "20px",
  padding: "6px 14px",
  marginBottom: "16px",
};
const badgeText = {
  fontSize: "11px",
  fontWeight: 800,
  color: "#0e7c4a",
  letterSpacing: "1px",
  margin: 0,
};
const h1 = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1530",
  margin: "0 0 12px",
};
const h2 = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1a1530",
  margin: "20px 0 12px",
};
const text = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#4a4458",
  margin: "0 0 12px",
};
const infoBox = {
  backgroundColor: "#faf8ff",
  border: "1px solid #ece9f5",
  borderRadius: "12px",
  padding: "16px 20px",
  margin: "20px 0",
};
const infoRow = {
  fontSize: "14px",
  margin: "6px 0",
  display: "flex",
  justifyContent: "space-between",
};
const infoLabel = {
  color: "#7c7c87",
  fontWeight: 500,
};
const infoValue = {
  color: "#1a1530",
  fontWeight: 700,
  fontFamily: "'Courier New', monospace",
};
const infoValueAccent = {
  color: "#b35900",
  fontWeight: 700,
};
const infoDivider = {
  borderColor: "#ece9f5",
  margin: "8px 0",
};
const hr = {
  borderColor: "#ece9f5",
  margin: "20px 0",
};
const footer = {
  fontSize: "12px",
  color: "#7c7c87",
  margin: "16px 0 4px",
};
const footerBrand = {
  fontSize: "11px",
  color: "#a09bb0",
  margin: 0,
};
