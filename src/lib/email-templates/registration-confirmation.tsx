import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "Kejar Prestasi";
const SITE_TAGLINE = "Beasiswa Section #3";

interface RegistrationConfirmationProps {
  fullName?: string;
  token?: string;
  kind?: "prestasi" | "ekonomi" | string;
  whatsapp?: string;
}

const kindLabel = (k?: string) =>
  k === "prestasi"
    ? "Beasiswa Prestasi"
    : k === "ekonomi"
      ? "Beasiswa Ekonomi"
      : "Beasiswa";

const RegistrationConfirmationEmail = ({
  fullName,
  token,
  kind,
  whatsapp,
}: RegistrationConfirmationProps) => (
  <Html lang="id" dir="ltr">
    <Head />
    <Preview>
      Pendaftaran {kindLabel(kind)} berhasil — simpan kode token Anda
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={brand}>{SITE_NAME}</Heading>
          <Text style={brandSub}>{SITE_TAGLINE}</Text>
        </Section>

        <Section style={card}>
          <Heading style={h1}>
            {fullName ? `Halo, ${fullName}!` : "Halo!"}
          </Heading>
          <Text style={text}>
            Terima kasih telah mendaftar pada program{" "}
            <strong>{kindLabel(kind)}</strong>. Pendaftaran Anda telah kami
            terima dengan sukses.
          </Text>

          <Section style={tokenBox}>
            <Text style={tokenLabel}>KODE TOKEN PENDAFTAR</Text>
            <Text style={tokenValue}>{token ?? "-"}</Text>
            <Text style={tokenHint}>
              Simpan kode ini baik-baik. Anda akan membutuhkannya untuk
              mengirim berkas pendukung dan cek status pendaftaran.
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Langkah Selanjutnya</Heading>
          <Text style={text}>
            <strong>1.</strong> Lengkapi pengiriman berkas pendukung di halaman{" "}
            <em>Kirim Berkas</em> menggunakan kode token di atas.
          </Text>
          <Text style={text}>
            <strong>2.</strong> Tim kami akan memverifikasi data &amp; berkas
            Anda.
          </Text>
          <Text style={text}>
            <strong>3.</strong> Pengumuman akan dikirimkan melalui email dan
            WhatsApp ke nomor {whatsapp || "yang Anda daftarkan"}.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Email ini dikirim otomatis. Jika ada pertanyaan, hubungi panitia
            melalui WhatsApp resmi.
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
  component: RegistrationConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Pendaftaran ${kindLabel(data?.kind)} Berhasil — Kode Token Anda`,
  displayName: "Konfirmasi Pendaftaran",
  previewData: {
    fullName: "Andi Pratama",
    token: "KP-PRE-A1B2C3",
    kind: "prestasi",
    whatsapp: "08123456789",
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
const tokenBox = {
  background: "linear-gradient(135deg, #f5f0ff 0%, #ede4ff 100%)",
  border: "1px dashed #5B2A9E",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "20px 0",
};
const tokenLabel = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#5B2A9E",
  letterSpacing: "1.5px",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};
const tokenValue = {
  fontSize: "26px",
  fontWeight: 800,
  color: "#3d1c6b",
  letterSpacing: "2px",
  fontFamily: "'Courier New', monospace",
  margin: "0 0 10px",
};
const tokenHint = {
  fontSize: "12px",
  color: "#6b5b8a",
  margin: 0,
  lineHeight: "1.5",
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
