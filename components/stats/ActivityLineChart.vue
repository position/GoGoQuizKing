<template>
    <div class="activity-line-chart">
        <div v-if="hasData" class="chart-container">
            <Line :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="no-data">
            <q-icon name="show_chart" size="48px" color="grey-5" />
            <p>활동 데이터가 없습니다</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import type { DailyActivity } from '@/models/stats';
import { CHART_COLORS } from '@/models/stats';
import dayjs from 'dayjs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

interface Props {
    data: DailyActivity[];
}

const props = defineProps<Props>();

const hasData = computed(() => props.data.some((d) => d.quizCount > 0));

const chartData = computed(() => ({
    labels: props.data.map((d) => dayjs(d.date).format('MM/DD')),
    datasets: [
        {
            label: '퀴즈 수',
            data: props.data.map((d) => d.quizCount),
            borderColor: CHART_COLORS.primary,
            backgroundColor: `${CHART_COLORS.primary}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: CHART_COLORS.primary,
        },
        {
            label: '정답 수',
            data: props.data.map((d) => d.correctCount),
            borderColor: CHART_COLORS.success,
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: CHART_COLORS.success,
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            callbacks: {
                afterBody: (context: any) => {
                    const index = context[0].dataIndex;
                    const activity = props.data[index];
                    const accuracy =
                        activity.totalQuestions > 0
                            ? Math.round((activity.correctCount / activity.totalQuestions) * 100)
                            : 0;
                    return `정답률: ${accuracy}%`;
                },
            },
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 7,
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
                stepSize: 1,
            },
        },
    },
}));
</script>

<style scoped lang="scss">
.activity-line-chart {
    height: 100%;
    min-height: 250px;

    .chart-container {
        height: 100%;
        position: relative;
    }

    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-secondary);

        p {
            margin-top: 12px;
            font-size: 14px;
        }
    }
}
</style>
