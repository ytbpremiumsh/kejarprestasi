import { createFileRoute } from "@tanstack/react-router";
import { GeneralAdministrationPage } from "@/components/GeneralAdministrationPage";

export const Route=createFileRoute("/administrasi/umum")({component:GeneralAdministrationPage});
