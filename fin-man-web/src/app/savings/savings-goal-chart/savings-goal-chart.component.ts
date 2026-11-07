import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { SavingsGoal, VirtualTransaction } from 'src/libs/core/models/savings';
import {
  AnalysisPoint,
  buildMonthlyAnalysis,
  MonthlyAnalysis,
  todayIso,
} from 'src/libs/core/utils/savings.utils';

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 16, bottom: 36, left: 72 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const MAX_LABELS = 12;
const TICK_INTERVALS = 4;

interface Bar {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
}

interface Tick {
  y: number;
  value: number;
}

interface Label {
  x: number;
  text: string;
}

function niceStep(max: number): number {
  const raw = max / TICK_INTERVALS;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  const factor = [1, 2, 2.5, 5, 10].find((f) => normalized <= f) ?? 10;
  return factor * magnitude;
}

/**
 * Bars for what was added each calendar month, a line for the cumulative amount
 * saved and a pace line from zero at creation to the target on the target date.
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

  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly plotLeft = MARGIN.left;
  readonly plotRight = WIDTH - MARGIN.right;
  readonly baseline = MARGIN.top + PLOT_HEIGHT;

  analysis: MonthlyAnalysis = {
    months: [],
    saved: [],
    pace: [],
    savedBefore: 0,
  };
  bars: Bar[] = [];
  ticks: Tick[] = [];
  labels: Label[] = [];
  savedPoints: { x: number; y: number }[] = [];
  savedLine = '';
  paceLine = '';

  ngOnChanges(): void {
    this.analysis = buildMonthlyAnalysis(
      this.goal,
      this.transactions,
      todayIso()
    );
    this.layout();
  }

  private layout(): void {
    const { months, saved, pace } = this.analysis;
    const count = months.length;
    const slot = PLOT_WIDTH / count;

    const highest = Math.max(
      0,
      ...months.map((month) => month.added),
      ...saved.map((point) => point.y),
      ...pace.map((point) => point.y)
    );
    const step = highest > 0 ? niceStep(highest) : 1;
    const top = Math.max(Math.ceil(highest / step), 1) * step;

    const toX = (x: number) => MARGIN.left + x * slot;
    const toY = (value: number) => MARGIN.top + PLOT_HEIGHT * (1 - value / top);
    const toPoints = (points: AnalysisPoint[]) =>
      points.map((point) => `${toX(point.x)},${toY(point.y)}`).join(' ');

    this.ticks = [];
    for (let value = 0; value <= top + step / 2; value += step) {
      this.ticks.push({ y: toY(value), value });
    }

    const barWidth = Math.min(slot * 0.5, 48);
    this.bars = months.map((month, index) => ({
      key: month.key,
      x: toX(index + 0.5) - barWidth / 2,
      y: toY(month.added),
      width: barWidth,
      height: this.baseline - toY(month.added),
      title: `${month.label}: ${month.added.toFixed(2)} EUR added`,
    }));

    const stride = Math.ceil(count / MAX_LABELS);
    this.labels = months
      .map((month, index) => ({ x: toX(index + 0.5), text: month.label }))
      .filter((_, index) => index % stride === 0);

    this.savedPoints = saved.map((point) => ({
      x: toX(point.x),
      y: toY(point.y),
    }));
    this.savedLine = toPoints(saved);
    this.paceLine = toPoints(pace);
  }
}
