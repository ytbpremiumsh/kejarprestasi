import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FileEdit,
  FileText,
  Settings,
  Megaphone,
  Code2,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Ringkasan",
    items: [{ title: "Overview", url: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Manajemen Pendaftaran",
    items: [
      { title: "Pendaftar", url: "/admin/pendaftar", icon: Users },
      { title: "Formulir", url: "/admin/formulir", icon: FileEdit },
    ],
  },
  {
    label: "Konten",
    items: [{ title: "Artikel", url: "/admin/artikel", icon: FileText }],
  },
  {
    label: "Pengaturan Situs",
    items: [
      { title: "Pengaturan", url: "/admin/pengaturan", icon: Settings },
      { title: "AdSense", url: "/admin/adsense", icon: Megaphone },
      { title: "Kode & Performa", url: "/admin/kode-kustom", icon: Code2 },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (url: string) =>
    url === "/admin" ? currentPath === "/admin" : currentPath.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">Admin Panel</p>
              <p className="text-[11px] text-sidebar-foreground/60">Kejar Prestasi</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
