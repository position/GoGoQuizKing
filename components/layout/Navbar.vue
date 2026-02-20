<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { DTO } from '@/models';
import { useAuthStore } from '@/store/auth.store';
import { storeToRefs } from 'pinia';
import { ToastMessage } from '@/helper/message';
import { useCommonStore } from '@/store/common.store';

const authStore = useAuthStore();
const commonStore = useCommonStore();
const { isLogin } = storeToRefs(authStore);
const { userInfo } = storeToRefs(authStore);
const { isMenuCollapse } = storeToRefs(commonStore);
const userInfoHeight = '160px';

const isDarkMode = computed(() => commonStore.isDarkMode);

onMounted(() => {
    commonStore.initTheme();
    commonStore.initMenuState();
});

async function logout() {
    await authStore.signOut();
    ToastMessage.success('Success');
}
</script>

<template>
    <q-drawer
        v-model="isMenuCollapse"
        show-if-above
        :width="220"
        :breakpoint="768"
        class="app-drawer"
        :class="{ 'drawer-dark': isDarkMode }"
    >
        <q-scroll-area
            :style="`height: calc(100% - ${userInfoHeight}); margin-top: ${userInfoHeight}`"
            class="drawer-scroll"
        >
            <q-list padding class="nav-list">
                <q-item :to="{ path: '/notice/notice-list' }" clickable v-ripple class="nav-item">
                    <q-item-section avatar>
                        <q-icon name="campaign" color="orange" />
                    </q-item-section>
                    <q-item-section>공지사항</q-item-section>
                </q-item>

                <q-item :to="{ path: '/quiz/quiz-list' }" clickable v-ripple class="nav-item">
                    <q-item-section avatar>
                        <q-icon name="explore" color="info" />
                    </q-item-section>
                    <q-item-section>퀴즈 탐험</q-item-section>
                </q-item>

                <q-item :to="{ path: '/quiz/quiz-create' }" clickable v-ripple class="nav-item">
                    <q-item-section avatar>
                        <q-icon name="add_circle" color="secondary" />
                    </q-item-section>
                    <q-item-section>퀴즈 만들기</q-item-section>
                </q-item>

                <q-item :to="{ path: '/quiz/my-quizzes' }" clickable v-ripple class="nav-item">
                    <q-item-section avatar>
                        <q-icon name="folder_special" color="amber" />
                    </q-item-section>
                    <q-item-section>내 퀴즈</q-item-section>
                </q-item>

                <!--                <q-separator class="nav-separator" />-->

                <!--                <q-item :to="{ path: '/ranking' }" clickable v-ripple class="nav-item">-->
                <!--                    <q-item-section avatar>-->
                <!--                        <q-icon name="leaderboard" color="primary" />-->
                <!--                    </q-item-section>-->
                <!--                    <q-item-section>랭킹</q-item-section>-->
                <!--                </q-item>-->
            </q-list>
        </q-scroll-area>

        <section class="user-info-container absolute-top" :style="`height: ${userInfoHeight}`">
            <client-only>
                <div v-if="!isLogin" class="before-login-area">
                    <div class="login-prompt">
                        <q-icon name="account_circle" size="48px" color="grey-5" />
                        <p>로그인하고 퀴즈왕이 되어봐요! 👑</p>
                    </div>
                    <q-btn
                        :to="{ path: '/login' }"
                        unelevated
                        rounded
                        label="로그인"
                        icon="login"
                        class="button-login"
                    />
                </div>
                <div v-else class="user-info-area">
                    <dl class="user-info">
                        <dt class="profile">
                            <q-avatar size="56px" class="user-avatar">
                                <!-- 외부 CDN(카카오 등) 이미지는 CORS 문제로 img 태그 사용 -->
                                <img
                                    v-if="userInfo?.avatar_url"
                                    :src="userInfo.avatar_url"
                                    :alt="userInfo.user_name"
                                    width="56"
                                    height="56"
                                    referrerpolicy="no-referrer"
                                    crossorigin="anonymous"
                                />
                                <q-icon v-else name="person" size="32px" />
                            </q-avatar>
                            <q-avatar
                                v-if="userInfo?.provider === DTO.Enums.AppProvider.Kakaotalk"
                                size="20px"
                                class="sns-icon"
                            >
                                <NuxtImg
                                    :src="`${$imgHost}/img/kakaotalk_sharing_btn_small.png`"
                                    :alt="userInfo?.user_name"
                                    loading="lazy"
                                    width="20"
                                    height="20"
                                />
                            </q-avatar>
                        </dt>
                        <dd class="user-name">
                            <span class="text-weight-bold">{{ userInfo.user_name }}</span>
                            <span class="user-email">{{ userInfo.email }}</span>
                        </dd>
                    </dl>

                    <q-btn
                        @click="logout"
                        label="로그아웃"
                        icon="logout"
                        flat
                        rounded
                        class="button-logout"
                    />
                </div>
            </client-only>
        </section>
    </q-drawer>
</template>

<style scoped lang="scss">
.app-drawer {
    background-color: var(--bg-card);
    transition: background-color 0.3s ease;
}

.drawer-dark {
    border-right: 1px solid var(--border-color);
}

.drawer-scroll {
    background-color: var(--bg-card);
}

.nav-list {
    padding: 8px;
}

.nav-item {
    border-radius: 12px;
    margin-bottom: 4px;
    color: var(--text-primary);
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--hover-overlay);
    }

    &.q-router-link--active,
    &.q-item--active {
        background: linear-gradient(135deg, var(--color-primary) 0%, #e55a5a 100%);
        color: white;

        .q-icon {
            color: white !important;
        }
    }
}

.nav-separator {
    margin: 12px 0;
    background-color: var(--border-color);
}

.before-login-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 16px;
    height: 100%;
    background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-card) 100%);
    border-bottom: 1px solid var(--border-color);

    .login-prompt {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;

        p {
            margin: 0;
            font-size: 14px;
            color: var(--text-secondary);
        }
    }

    .button-login {
        width: 100%;
        background-color: #fee500;
        color: #000;
        font-weight: 600;
        :deep(.q-icon) {
            color: #000;
        }
    }
}

.user-info-container {
    .user-info-area {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
        height: 100%;
        padding: 16px;
        background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-card) 100%);
        border-bottom: 1px solid var(--border-color);

        > .user-info {
            display: flex;
            align-items: center;
            gap: 12px;

            > .profile {
                position: relative;

                .user-avatar {
                    background: linear-gradient(
                        135deg,
                        var(--color-secondary) 0%,
                        var(--color-info) 100%
                    );
                    border: 2px solid var(--bg-card);
                    box-shadow: 0 2px 8px var(--shadow-color);
                }

                .sns-icon {
                    position: absolute;
                    bottom: 0;
                    right: -4px;
                    border: 2px solid var(--bg-card);
                }
            }

            > .user-name {
                font-size: 15px;
                color: var(--text-primary);
                > .user-email {
                    display: block;
                    width: 130px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 12px;
                    color: var(--text-secondary);
                }
            }
        }

        > .button-logout {
            margin-top: 8px;
            color: var(--text-secondary);

            &:hover {
                color: var(--color-primary);
            }
        }
    }
}
</style>
