import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SavingsGoal, VirtualTransaction } from 'src/libs/core/models/savings';
import {
  addDays,
  buildBurnup,
  Burnup,
  BurnupGoal,
  BurnupPoint,
  daysBetween,
  formatDayLabel,
  formatMonthLabel,
  todayIso,
} from 'src/libs/core/utils/savings.utils';

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = { top: 20, right: 16, bottom: 36, left: 72 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MAX_LABELS = 8;
const X_PAD = 16;
const TICK_INTERVALS = 4;

interface Tick {
  y: number;
  value: number;
}

interface Label {
  x: number;
  text: string;
}

interface Hover {
  x: number;
  left: number;
  align: 'start' | 'center' | 'end';
  date: string;
  saved: number | null;
  planned: number;
  savedY: number | null;
  plannedY: number;
}

function valueAt(points: BurnupPoint[], day: number): number {
  let value = points[0]?.y ?? 0;
  for (const point of points) {
    if (point.x > day) break;
    value = point.y;
  }
  return value;
}

function niceStep(max: number): number {
  const raw = max / TICK_INTERVALS;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  const factor = [1, 2, 2.5, 5, 10].find((f) => normalized <= f) ?? 10;
  return factor * magnitude;
}

/**
 * Burnup of a savings goal. The cumulative amount steps up on each deposit and
 * stops at today. The goal is either the flat target or the cumulative monthly
 * installments. One cursor marks today.
 */
@Component({
  selector: 'app-savings-goal-chart',
  templateUrl: './savings-goal-chart.component.html',
  styleUrls: ['./savings-goal-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CurrencyPipe],
})
export class SavingsGoalChartComponent implements OnChanges {
  @Input({ required: true }) goal!: SavingsGoal;
  @Input() transactions: VirtualTransaction[] = [];

  mode: BurnupGoal = 'monthly';

  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly plotLeft = MARGIN.left;
  readonly plotRight = WIDTH - MARGIN.right;
  readonly plotTop = MARGIN.top;
  readonly baseline = MARGIN.top + PLOT_HEIGHT;

  analysis: Burnup = {
    start: '',
    end: '',
    span: 0,
    goal: 0,
    mode: 'monthly',
    steps: [],
    plan: [],
    cursor: 0,
    current: 0,
    planned: 0,
    gap: 0,
    savedBefore: 0,
  };
  ticks: Tick[] = [];
  labels: Label[] = [];
  stepLine = '';
  goalLine = '';
  gapPoints = '';
  goalY = 0;
  plannedY = 0;
  cursorX = 0;
  cursorSavedY = 0;
  cursorLabelX = 0;
  cursorLabelY = 0;
  cursorLabelAnchor: 'start' | 'end' = 'start';
  hover: Hover | null = null;
  private scaleTop = 1;

  ngOnChanges(): void {
    this.rebuild();
  }

  setMode(mode: BurnupGoal): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.hover = null;
    this.rebuild();
  }

  onPlot(event: MouseEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height || !this.analysis.start) {
      this.hover = null;
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * this.width;
    const y = ((event.clientY - rect.top) / rect.height) * this.height;
    if (x < this.plotLeft || x > this.plotRight || y < this.plotTop || y > this.baseline) {
      this.hover = null;
      return;
    }

    const { span, cursor, steps, plan, start } = this.analysis;
    const day =
      span === 0
        ? 0
        : Math.round(
            ((x - (MARGIN.left + X_PAD)) / (PLOT_WIDTH - X_PAD * 2)) * span
          );
    const clamped = Math.min(Math.max(day, 0), span);
    const saved = clamped <= cursor ? valueAt(steps, clamped) : null;
    const planned = valueAt(plan, clamped);
    const pointX = this.dayToX(clamped);
    this.hover = {
      x: pointX,
      left: (pointX / this.width) * 100,
      align: pointX > this.plotRight - 130 ? 'end' : pointX < this.plotLeft + 130 ? 'start' : 'center',
      date: formatDayLabel(addDays(start, clamped)),
      saved,
      planned,
      savedY: saved == null ? null : this.valueToY(saved),
      plannedY: this.valueToY(planned),
    };
  }

  clearHover(): void {
    this.hover = null;
  }

  private rebuild(): void {
    this.analysis = buildBurnup(
      this.goal,
      this.transactions,
      todayIso(),
      this.mode
    );
    this.layout();
  }

  private layout(): void {
    const { steps, plan, span, goal, cursor, current, planned, start, end } =
      this.analysis;
    const highest = Math.max(
      0,
      goal,
      planned,
      ...steps.map((step) => step.y),
      ...plan.map((point) => point.y)
    );
    const step = highest > 0 ? niceStep(highest) : 1;
    let top = Math.max(Math.ceil(highest / step), 1) * step;
    if (highest > 0 && top <= highest) top += step;
    this.scaleTop = top;

    const toX = (day: number) => this.dayToX(day);
    const toY = (value: number) => this.valueToY(value);

    this.ticks = [];
    for (let value = 0; value <= top + step / 2; value += step) {
      this.ticks.push({ y: toY(value), value });
    }

    const toSvg = (point: BurnupPoint) => `${toX(point.x)},${toY(point.y)}`;
    this.stepLine = steps.map(toSvg).join(' ');
    this.goalLine = plan.map(toSvg).join(' ');
    this.goalY = toY(goal);
    this.plannedY = toY(planned);
    this.cursorX = toX(cursor);
    this.cursorSavedY = toY(current);

    const planToCursor = plan.filter((point) => point.x <= cursor);
    const lastPlan = planToCursor[planToCursor.length - 1];
    if (!lastPlan || lastPlan.x !== cursor || lastPlan.y !== planned) {
      planToCursor.push({ x: cursor, y: planned });
    }
    this.gapPoints = [
      ...steps.map(toSvg),
      ...[...planToCursor].reverse().map(toSvg),
    ].join(' ');

    const nearRight = this.cursorX > this.plotRight - 72;
    this.cursorLabelAnchor = nearRight ? 'end' : 'start';
    this.cursorLabelX = this.cursorX + (nearRight ? -8 : 8);
    const above = this.cursorSavedY - 12;
    this.cursorLabelY = above < MARGIN.top + 12 ? this.cursorSavedY + 16 : above;

    this.labels = this.axisLabels(start, end, span, toX);
  }

  private dayToX(day: number): number {
    const span = this.analysis.span;
    if (span === 0) return MARGIN.left + PLOT_WIDTH / 2;
    return MARGIN.left + X_PAD + (day / span) * (PLOT_WIDTH - X_PAD * 2);
  }

  private valueToY(value: number): number {
    return MARGIN.top + PLOT_HEIGHT * (1 - value / this.scaleTop);
  }

  private axisLabels(
    start: string,
    end: string,
    span: number,
    toX: (day: number) => number
  ): Label[] {
    if (!start || !end) return [];
    if (span <= 62) {
      const labels = [{ x: toX(0), text: formatMonthLabel(start, true) }];
      if (span > 0) labels.push({ x: toX(span), text: formatMonthLabel(end, true) });
      return labels;
    }

    const [startYear, startMonth] = start.split('-').map(Number);
    const [endYear, endMonth] = end.split('-').map(Number);
    const marks: { day: number; text: string }[] = [];
    let year = startYear;
    let month = startMonth;
    while (year < endYear || (year === endYear && month <= endMonth)) {
      const iso = `${year}-${String(month).padStart(2, '0')}-01`;
      const day = iso < start ? 0 : daysBetween(start, iso);
      if (day <= span && (marks.length === 0 || marks[marks.length - 1].day !== day)) {
        marks.push({
          day,
          text: formatMonthLabel(iso < start ? start : iso, false),
        });
      }
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    const stride = Math.max(Math.ceil(marks.length / MAX_LABELS), 1);
    return marks
      .filter((_, index) => index % stride === 0)
      .map((mark) => ({ x: toX(mark.day), text: mark.text }));
  }
}
