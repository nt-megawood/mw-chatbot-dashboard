import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnalyticsTimeframe } from '@/lib/analytics-utils';
import type { HourlyActivityItem, TimelineItem } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

type ChartsGridProps = {
  conversationDaily: TimelineItem[];
  messageDaily: TimelineItem[];
  conversationHourly: HourlyActivityItem[];
  messageHourly: HourlyActivityItem[];
  chartOptions: object;
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (value: AnalyticsTimeframe) => void;
};

function ChartCard({ title, hasData, children }: { title: string; hasData: boolean; children: React.ReactNode }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          {hasData ? children : <p className="mt-6 text-sm text-muted-foreground">Noch keine Daten vorhanden.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartsGrid({
  conversationDaily,
  messageDaily,
  conversationHourly,
  messageHourly,
  chartOptions,
  timeframe,
  onTimeframeChange,
}: ChartsGridProps) {
  const trendLabelByTimeframe: Record<AnalyticsTimeframe, string> = {
    daily: 'Tag',
    weekly: 'Woche',
    monthly: 'Monat',
    yearly: 'Jahr',
  };

  const timeframes: AnalyticsTimeframe[] = ['daily', 'weekly', 'monthly', 'yearly'];

  const conversationDailyData = {
    labels: conversationDaily.map((item) => item.date),
    datasets: [
      {
        label: `Konversationen / ${trendLabelByTimeframe[timeframe]}`,
        data: conversationDaily.map((item) => item.count),
        borderColor: '#b4032f',
        backgroundColor: 'rgba(180, 3, 47, 0.14)',
        fill: true,
        tension: 0.25,
      },
    ],
  };

  const messageDailyData = {
    labels: messageDaily.map((item) => item.date),
    datasets: [
      {
        label: `Nachrichten / ${trendLabelByTimeframe[timeframe]}`,
        data: messageDaily.map((item) => item.count),
        borderColor: '#7f102d',
        backgroundColor: 'rgba(127, 16, 45, 0.16)',
        fill: true,
        tension: 0.25,
      },
    ],
  };

  const messageHourlyData = {
    labels: messageHourly.map((item) => item.hour),
    datasets: [
      {
        label: 'Nachrichten je Stunde',
        data: messageHourly.map((item) => item.count),
        backgroundColor: 'rgba(180, 3, 47, 0.75)',
        borderColor: '#b4032f',
        borderWidth: 1,
      },
    ],
  };

  const conversationHourlyData = {
    labels: conversationHourly.map((item) => item.hour),
    datasets: [
      {
        label: 'Aktivität nach Uhrzeit',
        data: conversationHourly.map((item) => item.count),
        backgroundColor: 'rgba(141, 15, 50, 0.75)',
        borderColor: '#8d0f32',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2">
        <p className="text-sm text-muted-foreground">Trendintervall</p>
        <div className="flex flex-wrap gap-2">
          {timeframes.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={timeframe === option ? 'default' : 'outline'}
              onClick={() => onTimeframeChange(option)}
            >
              {option === 'daily' ? 'Täglich' : option === 'weekly' ? 'Wöchentlich' : option === 'monthly' ? 'Monatlich' : 'Jährlich'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title={`Konversationen je ${trendLabelByTimeframe[timeframe]} (Trend)`} hasData={conversationDaily.length > 0}>
        <Line options={chartOptions} data={conversationDailyData} />
      </ChartCard>

      <ChartCard title={`Nachrichten je ${trendLabelByTimeframe[timeframe]} (Trend)`} hasData={messageDaily.length > 0}>
        <Line options={chartOptions} data={messageDailyData} />
      </ChartCard>

      <ChartCard title="Nachrichten nach Uhrzeit" hasData={messageHourly.length > 0}>
        <Bar options={chartOptions} data={messageHourlyData} />
      </ChartCard>

      <ChartCard title="Konversationsaktivität nach Uhrzeit" hasData={conversationHourly.length > 0}>
        <Bar options={chartOptions} data={conversationHourlyData} />
      </ChartCard>
      </div>
    </div>
  );
}
