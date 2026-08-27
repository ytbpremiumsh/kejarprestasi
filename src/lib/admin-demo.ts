export const ADMIN_DEMO_EMAIL = "demo@kejarprestasi.id";
export const ADMIN_DEMO_PASSWORD = "DemoKejarPrestasi2026!";
export const ADMIN_DEMO_KEY = "kp_admin_demo";

export const isAdminDemo = () => typeof window !== "undefined" && sessionStorage.getItem(ADMIN_DEMO_KEY) === "1";
export const startAdminDemo = () => sessionStorage.setItem(ADMIN_DEMO_KEY, "1");
export const stopAdminDemo = () => sessionStorage.removeItem(ADMIN_DEMO_KEY);
