<template>
    <main>
        <PokerStories />
        <KingOfStaking />
        <StakingNow />
        <LazyBanner />
        <LazyRecentSeries />
        <LazyYoutubeVideos />
    </main>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'PokerStake Home',
    hiddenBreadcrumb: true,
});
</script>

<style scoped lang="scss">
main {
    display: grid;
    grid-template-columns: 62.739% 1fr; // 724px 410px
    grid-template-areas:
        'poker-stories poker-ranking'
        'staking-now staking-now'
        'banner-main banner-aside'
        'recent-series video-wrapper'
        'recent-series video-wrapper';
    gap: 20px;
    width: 100%;
    padding: 20px 0;
}
@media screen and (max-width: 905px) {
    main {
        display: grid;
        grid-template-columns: 100%;
        grid-template-areas:
            'poker-stories'
            'staking-now'
            'banner-main'
            'recent-series'
            'poker-ranking'
            'poker-ranking-all-time'
            'poker-ranking-country'
            'poker-ranking-staking'
            'banner-aside'
            'video-wrapper';
        gap: 0;
        padding: 0;
    }
}
</style>
