import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, FileEdit, FileText, FolderArchive, Settings, Megaphone, Code2, MessageCircle, Bot, ShieldCheck, ChevronRight, Trophy, Heart, Server, Globe, BarChart3, Share2, Image as ImageIcon, Mail, HardDrive, Rocket, Wrench, CreditCard, PenLine, ListChecks } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; step?: number };
const groups: { label: string; items: Item[] }[] = [
  { label: "Command Center", items: [{ title: "Ringkasan", url: "/admin", icon: LayoutDashboard }, { title: "Google Analytics", url: "/admin/analytics", icon: BarChart3 }] },
  { label: "Alur Pendaftaran", items: [{ title: "Pendaftar", url: "/admin/pendaftar", icon: Users, step: 1 }, { title: "Pengiriman Esai", url: "/admin/esai", icon: PenLine, step: 2 }, { title: "Pengiriman Berkas", url: "/admin/berkas", icon: FolderArchive, step: 3 }, { title: "Tahapan Seleksi", url: "/admin/seleksi", icon: ListChecks, step: 4 }, { title: "Kandidat Lolos", url: "/admin/kandidat", icon: Trophy, step: 5 }] },
  { label: "Konten & Formulir", items: [{ title: "Artikel", url: "/admin/artikel", icon: FileText }, { title: "Formulir", url: "/admin/formulir", icon: FileEdit }, { title: "Bagikan Poster", url: "/admin/bagikan-poster", icon: Share2 }, { title: "Media & File", url: "/admin/media", icon: HardDrive }] },
  { label: "Komunikasi & Transaksi", items: [{ title: "WhatsApp", url: "/admin/whatsapp", icon: MessageCircle }, { title: "Balasan AI", url: "/admin/ai-balasan", icon: Bot }, { title: "Pembayaran", url: "/admin/pembayaran", icon: CreditCard }, { title: "Donasi", url: "/admin/donasi", icon: Heart }] },
  { label: "Integrasi & Pengaturan", items: [{ title: "Pengaturan Situs", url: "/admin/pengaturan", icon: Settings }, { title: "Logo Situs", url: "/admin/branding", icon: ImageIcon }, { title: "Template Email", url: "/admin/email-template", icon: Mail }, { title: "Keamanan (2FA)", url: "/admin/keamanan", icon: ShieldCheck }, { title: "AdSense", url: "/admin/adsense", icon: Megaphone }, { title: "Iklan Kustom", url: "/admin/iklan-kustom", icon: Megaphone }, { title: "Kode & Performa", url: "/admin/kode-kustom", icon: Code2 }] },
  { label: "Sistem", items: [{ title: "Sistem Update", url: "/admin/sistem-update", icon: Rocket }, { title: "Mode Maintenance", url: "/admin/maintenance", icon: Wrench }] },
  { label: "Dokumentasi", items: [{ title: "Instalasi VPS", url: "/admin/instalasi/vps", icon: Server }, { title: "Instalasi Hosting", url: "/admin/instalasi/hosting", icon: Globe }] },
];

function DimensionalIcon({ Icon, active }: { Icon: Item["icon"]; active: boolean }) {
  return <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border transition-all", active ? "border-white/35 bg-white/20 text-white shadow-sm" : "border-violet-100 bg-gradient-to-br from-white via-violet-50 to-indigo-100 text-violet-700 shadow-sm group-hover/btn:-translate-y-0.5")}><Icon className="h-4 w-4" /></span>;
}

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (state) => state.location.pathname });
  const isActive = (url: string) => url === "/admin" ? path === "/admin" : path.startsWith(url);
  return <Sidebar collapsible="icon" className="border-r border-violet-100">
    <SidebarHeader className="border-b border-violet-100 bg-white"><div className="flex items-center gap-3 px-2 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-300/60"><ShieldCheck className="h-5 w-5" /></span>{!collapsed && <div><p className="text-sm font-black tracking-tight text-indigo-950">Kejar Prestasi</p><p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-600">Admin Workspace</p></div>}</div></SidebarHeader>
    <SidebarContent className="bg-white px-2 py-3">{groups.map((group, index) => <SidebarGroup key={group.label} className={cn(index > 0 && "mt-1")}>{!collapsed && <SidebarGroupLabel className="px-2 text-[9px] font-black uppercase tracking-[.18em] text-violet-400">{group.label}</SidebarGroupLabel>}<SidebarGroupContent><SidebarMenu className="gap-1">{group.items.map((item) => { const active = isActive(item.url); return <SidebarMenuItem key={item.url}><SidebarMenuButton asChild tooltip={item.title} className={cn("group/btn h-11 rounded-xl px-2 font-semibold transition-all", active ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_8px_18px_rgba(109,40,217,.22)] hover:text-white" : "text-slate-600 hover:bg-violet-50 hover:text-violet-800")}><Link to={item.url} className="flex w-full items-center gap-3"><DimensionalIcon Icon={item.icon} active={active} />{!collapsed && <><span className="flex-1 text-[13px]">{item.title}</span>{item.step ? <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[9px] font-black", active ? "bg-white/20 text-white" : "bg-violet-50 text-violet-500")}>{item.step}</span> : <ChevronRight className={cn("h-3.5 w-3.5", active ? "opacity-80" : "opacity-0 group-hover/btn:opacity-40")} />}</>}</Link></SidebarMenuButton></SidebarMenuItem>; })}</SidebarMenu></SidebarGroupContent></SidebarGroup>)}</SidebarContent>
  </Sidebar>;
}
