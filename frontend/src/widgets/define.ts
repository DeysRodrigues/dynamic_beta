import type { ComponentType, LazyExoticComponent, ReactNode } from "react";
import type { ZodType } from "zod";

/** What the grid hands to every widget component. A widget uses only what it needs. */
export interface WidgetProps {
  /** The box id, e.g. `notepad-k3j2h1`. Content stores key their data by it. */
  id: string;
  /** The active project, or `null` on a regular workspace. */
  projectId: string | null;
  /** Styling hook that a few widgets accept. The grid does not pass it today. */
  className?: string;
}

export interface WidgetDefinition {
  /** The widget type. Box ids are `<type>-<random>`. */
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  /** Tailwind classes for the store card, or a CSS color. */
  color: string;
  /** Initial height in grid rows. */
  defaultHeight: number;
  /**
   * Must be `React.lazy`: the type rejects a plain component, so a widget cannot end up in the
   * initial bundle by accident.
   */
  component: LazyExoticComponent<ComponentType<WidgetProps>>;
  /**
   * Shape of the content this widget saves, when it has one. The content store validates reads
   * and writes against it, and a server can reuse it to validate what it receives.
   */
  schema?: ZodType;
  /** Offered in the widget store and the project picker. Defaults to `true`. */
  inCatalog?: boolean;
}

/** Identity helper that gives a widget declaration its type and checks it at compile time. */
export function defineWidget(definition: WidgetDefinition): WidgetDefinition {
  return definition;
}
