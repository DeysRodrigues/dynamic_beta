import type { WidgetDefinition } from "./define";

import tasksWidget from "./boxes/tasks";
import pomodoroWidget from "./boxes/pomodoro";
import notepadWidget from "./boxes/notepad";
import embeddedWidget from "./boxes/embedded";
import rpgWidget from "./boxes/rpg";
import gardenWidget from "./boxes/garden";
import libraryWidget from "./boxes/library";
import habitWidget from "./boxes/habit";
import workoutWidget from "./boxes/workout";
import calendarWidget from "./boxes/calendar";
import booksWidget from "./boxes/books";
import goalsWidget from "./boxes/goals";
import autoWidget from "./boxes/auto";
import countdownWidget from "./boxes/countdown";
import themeWidget from "./boxes/theme";
import progressWidget from "./boxes/progress";
import tagsWidget from "./boxes/tags";
import snippetWidget from "./boxes/snippet";
import quicklinksWidget from "./boxes/quicklinks";
import riskWidget from "./boxes/risk";
import presenceWidget from "./boxes/presence";
import activityWidget from "./boxes/activity";
import threefrogsWidget from "./boxes/three_frogs";
import metatagsWidget from "./boxes/metatags";
import projectoverviewWidget from "./boxes/project_overview";

/**
 * Every widget the dashboard can render, in the order the widget store shows them.
 *
 * To add a widget: write its declaration in `boxes/<id>.tsx` and list it here. The grid, the
 * store, the project picker and the default heights all read from this list.
 */
export const widgetList: readonly WidgetDefinition[] = [
  tasksWidget,
  pomodoroWidget,
  notepadWidget,
  embeddedWidget,
  rpgWidget,
  gardenWidget,
  libraryWidget,
  habitWidget,
  workoutWidget,
  calendarWidget,
  booksWidget,
  goalsWidget,
  autoWidget,
  countdownWidget,
  themeWidget,
  progressWidget,
  tagsWidget,
  snippetWidget,
  quicklinksWidget,
  riskWidget,
  presenceWidget,
  activityWidget,
  threefrogsWidget,
  metatagsWidget,
  projectoverviewWidget,
];

export const widgetRegistry: Readonly<Record<string, WidgetDefinition>> = Object.fromEntries(
  widgetList.map((widget) => [widget.id, widget])
);

/** Widgets the user can pick from the store. */
export const catalogWidgets = widgetList.filter((widget) => widget.inCatalog !== false);

export const FALLBACK_HEIGHT = 3;

export function getDefaultHeight(type: string): number {
  return widgetRegistry[type]?.defaultHeight ?? FALLBACK_HEIGHT;
}
