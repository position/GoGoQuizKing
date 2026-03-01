<template>
    <div class="difficulty-bar-chart">
        <div v-if="hasData" class="chart-container">
            <Bar :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="no-data">
            <q-icon name="bar_chart" size="48px" color="grey-5" />
            <p>난이도별 데이터가 없습니다</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'vue-chartjs';
import type { DifficultyStats } from '@/models/stats';
import { DIFFICULTIES, type DifficultyLevel } from '@/models/quiz';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    data: DifficultyStats[];
}

const props = defineProps<Props>();

const hasData = computed(() => props.data.length > 0);

// 난이도 타입명을 한글 라벨로 변환
const getDifficultyLabel = (difficulty: string): string => {
    const difficultyInfo = DIFFICULTIES[difficulty as DifficultyLevel];
    return difficultyInfo ? difficultyInfo.label : difficulty;
};

const getDifficultyColor = (difficulty: string): string => {
    const difficultyInfo = DIFFICULTIES[difficulty as DifficultyLevel];
    return difficultyInfo ? difficultyInfo.color : '#78909c';
};

const sortedData = computed(() => {
    const order = ['seedling', 'leaf', 'tree', 'king'];
    return [...props.data].sort((a, b) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty));
});

const chartData = computed(() => ({
    labels: sortedData.value.map((s) => getDifficultyLabel(s.difficulty)),
    datasets: [
        {
            label: '정답률 (%)',
            data: sortedData.value.map((s) => s.accuracy),
            backgroundColor: sortedData.value.map((s) => getDifficultyColor(s.difficulty)),
            borderRadius: 8,
            borderSkipped: false,
        },
    ],
}));

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                afterLabel: (context: any) => {
                    const stats = sortedData.value[context.dataIndex];
                    return [
                        `퀴즈 수: ${stats.attemptCount}회`,
                        `평균 시간: ${Math.floor(stats.avgTimeSpent / 60)}분 ${stats.avgTimeSpent % 60}초`,
                    ];
                },
            },
        },
    },
    scales: {
        x: {
            beginAtZero: true,
            max: 100,
            grid: {
                display: false,
            },
            ticks: {
                callback: (value: any) => `${value}%`,
            },
        },
        y: {
            grid: {
                display: false,
            },
            ticks: {
                font: {
                    size: 13,
                    weight: '500',
                },
            },
        },
    },
}));
</script>

<style scoped lang="scss">
.difficulty-bar-chart {
    height: 100%;
    min-height: 150px;

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
