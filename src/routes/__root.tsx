import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { AdSettingsProvider, AdsenseLoader } from "@/components/ads/AdSettings";
import { AutoAdInjector } from "@/components/ads/AutoAdInjector";
import { CustomAdInjector } from "@/components/ads/CustomAdInjector";
import { CustomCodeInjector } from "@/components/CustomCodeInjector";
import { AnalyticsInjector } from "@/components/AnalyticsInjector";
import { ForceReloadNavigation } from "@/components/ForceReloadNavigation";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Beasiswa Pendidikan Kejar Prestasi Section #3" },
      { name: "description", content: "Program beasiswa nasional untuk pelajar dan mahasiswa Indonesia dengan total beasiswa Rp17.000.000 per semester. Tidak dipungut biaya." },
      { name: "author", content: "Kejar Prestasi" },
      { property: "og:title", content: "Beasiswa Pendidikan Kejar Prestasi Section #3" },
      { property: "og:description", content: "Program beasiswa nasional untuk pelajar dan mahasiswa Indonesia dengan total beasiswa Rp17.000.000 per semester. Tidak dipungut biaya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Beasiswa Pendidikan Kejar Prestasi Section #3" },
      { name: "twitter:description", content: "Program beasiswa nasional untuk pelajar dan mahasiswa Indonesia dengan total beasiswa Rp17.000.000 per semester. Tidak dipungut biaya." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/957b997d-0c39-40b2-86e1-5cccaba42847" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/957b997d-0c39-40b2-86e1-5cccaba42847" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isBareLayout = pathname.startsWith("/admin") || pathname.startsWith("/login");
  const isPublic = !isBareLayout;

  return (
    <QueryClientProvider client={queryClient}>
      <AdSettingsProvider>
        {isPublic && (
          <>
            <AdsenseLoader />
            <AutoAdInjector />
            <CustomAdInjector />
          </>
        )}
        <CustomCodeInjector />
        <AnalyticsInjector />
        <ForceReloadNavigation />
        {isBareLayout ? (
          <Outlet />
        ) : (
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
          </div>
        )}
        <Toaster richColors position="top-center" />
      </AdSettingsProvider>
    </QueryClientProvider>
  );
}
