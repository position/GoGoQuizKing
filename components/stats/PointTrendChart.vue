<template>
    <div class="point-trend-chart">
        <div v-if="hasData" class="chart-container">
            <Line :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="no-data">
            <q-icon name="sym_o_trending_up" size="48px" color="grey-5" />
            <p>포인트 데이터가 없습니다</p>
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
import type { PointTrend } from '@/models/stats';
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
    Filler
);

interface Props {
    data: PointTrend[];
    showCumulative?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showCumulative: false,
});

const hasData = computed(() => props.data.some((d) => d.points > 0));

const chartData = computed(() => {
    const datasets: any[] = [
        {
            label: '일일 포인트',
            data: props.data.map((d) => d.points),
            borderColor: CHART_COLORS.accent,
            backgroundColor: `${CHART_COLORS.accent}30`,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6,
            pointBackgroundColor: CHART_COLORS.accent,
            yAxisID: 'y',
        },
    ];

    if (props.showCumulative) {
        datasets.push({
            label: '누적 포인트',
            data: props.data.map((d) => d.cumulativePoints),
            borderColor: CHART_COLORS.purple,
            backgroundColor: 'transparent',
            borderDash: [3, 3],
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y1',
        });
    }

    return {
        labels: props.data.map((d) => dayjs(d.date).format('MM/DD')),
        datasets,
    };
});

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
                label: (context: any) => {
                    const value = context.raw;
                    return `${context.dataset.label}: ${value.toLocaleString()} P`;
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
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
            title: {
                display: true,
                text: '일일 포인트',
                font: {
                    size: 11,
                },
            },
        },
        ...(props.showCumulative && {
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: '누적 포인트',
                    font: {
                        size: 11,
                    },
                },
            },
        }),
    },
}));
</script>

<style scoped lang="scss">
.point-trend-chart {
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
        color: #9e9e9e;

        p {
            margin-top: 12px;
            font-size: 14px;
        }
    }
}
</style>
