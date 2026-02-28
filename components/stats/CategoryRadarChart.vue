<template>
    <div class="category-radar-chart">
        <div v-if="hasData" class="chart-container">
            <Radar :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="no-data">
            <q-icon name="category" size="48px" color="grey-5" />
            <p>카테고리별 데이터가 없습니다</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'vue-chartjs';
import type { CategoryStats } from '@/models/stats';
import { CATEGORY_COLORS, CHART_COLORS } from '@/models/stats';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Props {
    data: CategoryStats[];
}

const props = defineProps<Props>();

const hasData = computed(() => props.data.length > 0);

const chartData = computed(() => ({
    labels: props.data.map((s) => s.category),
    datasets: [
        {
            label: '정답률 (%)',
            data: props.data.map((s) => s.accuracy),
            backgroundColor: `${CHART_COLORS.primary}40`,
            borderColor: CHART_COLORS.primary,
            borderWidth: 2,
            pointBackgroundColor: props.data.map(
                (s) => CATEGORY_COLORS[s.category] || CHART_COLORS.primary
            ),
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: CHART_COLORS.primary,
            pointRadius: 5,
            pointHoverRadius: 7,
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: (context: any) => {
                    const stats = props.data[context.dataIndex];
                    return [
                        `정답률: ${context.raw}%`,
                        `퀴즈 수: ${stats.attemptCount}회`,
                        `정답: ${stats.correctCount}/${stats.totalQuestions}`,
                    ];
                },
            },
        },
    },
    scales: {
        r: {
            beginAtZero: true,
            max: 100,
            ticks: {
                stepSize: 20,
                font: {
                    size: 10,
                },
            },
            pointLabels: {
                font: {
                    size: 12,
                    weight: '600',
                },
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
            },
            angleLines: {
                color: 'rgba(0, 0, 0, 0.1)',
            },
        },
    },
}));
</script>

<style scoped lang="scss">
.category-radar-chart {
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
