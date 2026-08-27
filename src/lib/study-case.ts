export type StudyKind = "prestasi" | "ekonomi" | "umum";
export type VerifiedRegistrant = { full_name: string; email?: string | null; school_name?: string | null; education_level?: string | null };
export type StudyAccess = { token: string; kind: StudyKind; registrant: VerifiedRegistrant; expiresAt: number };

export const studyCases: Record<StudyKind, string[]> = {
  prestasi: [
    "Ceritakan satu pencapaian yang paling berarti bagimu. Jelaskan proses, tantangan, dan pelajaran yang kamu dapatkan dari pencapaian tersebut.",
    "Kamu memiliki target prestasi yang penting, tetapi waktu belajar dan kegiatan organisasi bertabrakan. Bagaimana kamu menentukan prioritas dan menjaga kualitas keduanya?",
    "Jika hasil yang kamu peroleh tidak sesuai target meskipun sudah berusaha, langkah evaluasi apa yang akan kamu lakukan agar percobaan berikutnya lebih baik?",
    "Bayangkan kamu diminta membuat kegiatan sederhana yang dapat membantu teman-teman di sekolah atau kampus berkembang. Program apa yang akan kamu buat dan bagaimana menjalankannya?",
    "Jika menjadi Awardee Kejar Prestasi, target pengembangan diri apa yang ingin kamu capai dalam satu tahun dan dampak apa yang ingin kamu berikan kepada lingkunganmu?",
  ],
  ekonomi: [
    "Ceritakan tantangan utama yang pernah memengaruhi proses pendidikanmu dan bagaimana kamu berusaha agar tetap dapat belajar serta melanjutkan pendidikan.",
    "Jika kebutuhan pendidikan harus diprioritaskan sementara sumber daya yang tersedia terbatas, kebutuhan apa yang akan kamu dahulukan dan mengapa?",
    "Bayangkan kamu menerima dukungan dana pendidikan. Bagaimana kamu akan mengalokasikannya agar memberikan manfaat paling besar bagi proses belajarmu?",
    "Apa strategi yang akan kamu lakukan untuk tetap meningkatkan kemampuan dan prestasi meskipun menghadapi keterbatasan fasilitas atau biaya pendidikan?",
    "Jika menjadi Awardee Kejar Prestasi, perubahan apa yang ingin kamu capai untuk pendidikanmu dan bagaimana kamu ingin memberi dampak positif bagi keluarga atau lingkungan sekitar?",
  ],
  umum: [
    "Ceritakan tentang dirimu, nilai yang kamu pegang, serta pengalaman yang paling membentuk perjalanan pendidikanmu.",
    "Apa tantangan terbesar yang sedang kamu hadapi dalam pendidikan, dan langkah nyata apa yang sudah atau akan kamu lakukan untuk mengatasinya?",
    "Jika menerima dukungan Beasiswa Umum, bagaimana kamu akan memanfaatkannya untuk mendukung studi dan pengembangan dirimu?",
    "Ceritakan pengalaman organisasi, pelatihan, proyek, atau kegiatan sosial yang pernah kamu ikuti dan pelajaran yang kamu peroleh.",
    "Apa target pendidikan dan kontribusi yang ingin kamu capai dalam satu tahun setelah menjadi Awardee Kejar Prestasi?",
  ],
};

export const studyPrefix = (kind: StudyKind) => kind === "prestasi" ? "KP-PRE-" : kind === "ekonomi" ? "KP-EKO-" : "KP-UMM-";
export const studyLabel = (kind: StudyKind) => kind === "prestasi" ? "Prestasi" : kind === "ekonomi" ? "Ekonomi" : "Umum";
export const studyNextPath = (kind: StudyKind) => kind === "prestasi" ? "/administrasi/prestasi" : kind === "ekonomi" ? "/administrasi/ekonomi" : "/administrasi/umum";
const ACCESS_KEY = "kp-study-verified-access";

export function saveStudyAccess(token: string, kind: StudyKind, registrant: VerifiedRegistrant) {
  sessionStorage.setItem(ACCESS_KEY, JSON.stringify({ token, kind, registrant, expiresAt: Date.now() + 30 * 60 * 1000 }));
}
export function readStudyAccess(): StudyAccess | null {
  try {
    const access = JSON.parse(sessionStorage.getItem(ACCESS_KEY) || "null") as StudyAccess | null;
    if (!access?.token || !access.kind || !access.registrant || access.expiresAt <= Date.now()) { sessionStorage.removeItem(ACCESS_KEY); return null; }
    return access;
  } catch { sessionStorage.removeItem(ACCESS_KEY); return null; }
}
export function clearStudyAccess() { sessionStorage.removeItem(ACCESS_KEY); }
