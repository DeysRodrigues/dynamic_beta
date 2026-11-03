import { lazy } from "react";
import { Briefcase } from "lucide-react";
import { defineWidget, type WidgetProps } from "../define";

export default defineWidget({
  id: "project_overview",
  title: "Visão Geral",
  description: "Metas e rotinas do projeto.",
  icon: <Briefcase size={24} />,
  color: "",
  defaultHeight: 5,
  // Only makes sense inside a project, so it stays out of the widget store.
  inCatalog: false,
  component: lazy(async () => {
    const { default: ProjectOverviewBox } = await import(
      "@/components/layout/boxes/ProjectOverviewBox"
    );
    return {
      default: ({ projectId }: WidgetProps) =>
        projectId ? <ProjectOverviewBox projectId={projectId} /> : null,
    };
  }),
});
