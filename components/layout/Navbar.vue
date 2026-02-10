<script setup lang="ts">
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
const userInfoHeight = '145px';

async function logout() {
    await authStore.signOut();
    ToastMessage.success('Success');
}
</script>

<template>
    <q-drawer v-model="isMenuCollapse" show-if-above :width="200" :breakpoint="400">
        <q-scroll-area
            :style="`height: calc(100% - ${userInfoHeight}); margin-top: ${userInfoHeight}`"
        >
            <q-list padding>
                <q-item :to="{ path: '/notice/notice-list' }" clickable v-ripple>
                    <q-item-section avatar>
                        <q-icon name="inbox" />
                    </q-item-section>

                    <q-item-section>공지사항</q-item-section>
                </q-item>

                <q-item :to="{ path: '/quiz/quiz-list' }" clickable v-ripple>
                    <q-item-section avatar>
                        <q-icon name="quiz" />
                    </q-item-section>

                    <q-item-section>퀴즈 탐험</q-item-section>
                </q-item>

                <q-item :to="{ path: '/quiz/my-quizzes' }" clickable v-ripple>
                    <q-item-section avatar>
                        <q-icon name="edit_note" />
                    </q-item-section>

                    <q-item-section>내 퀴즈</q-item-section>
                </q-item>

                <q-item :to="{ path: '/ranking' }" clickable v-ripple>
                    <q-item-section avatar>
                        <q-icon name="leaderboard" />
                    </q-item-section>

                    <q-item-section>랭킹</q-item-section>
                </q-item>
            </q-list>
        </q-scroll-area>

        <section class="user-info-container absolute-top" :style="`height: ${userInfoHeight}`">
            <div v-if="!isLogin" class="before-login-area">
                <p>로그인 해주세요!</p>
                <q-btn
                    :to="{ path: '/login' }"
                    push
                    outline
                    rounded
                    label="Login"
                    class="button-login"
                />
            </div>
            <div v-else class="user-info-area absolute-bottom bg-transparent">
                <dl class="user-info">
                    <dt class="profile">
                        <q-avatar size="56px"
                            ><img
                                v-if="userInfo?.avatar_url"
                                :src="userInfo.avatar_url"
                                :alt="userInfo.user_name"
                        /></q-avatar>
                        <q-avatar
                            v-if="userInfo?.provider === DTO.Enums.AppProvider.Kakaotalk"
                            size="20px"
                            class="sns-icon"
                        >
                            <img
                                :src="`${$imgHost}/img/kakaotalk_sharing_btn_small.png`"
                                :alt="userInfo?.user_name"
                                loading="lazy"
                            />
                        </q-avatar>
                    </dt>
                    <dd class="user-name">
                        <span class="text-weight-bold">{{ userInfo.user_name }}</span>
                    </dd>
                </dl>
                <div class="user-email">{{ userInfo.email }}</div>
                <q-btn
                    @click="logout"
                    label="Logout"
                    icon="fas fa-arrow-right-from-bracket"
                    color="primary"
                    push
                    outline
                    rounded
                    class="button-logout"
                />
            </div>
        </section>
    </q-drawer>
</template>

<style scoped lang="scss">
.before-login-area {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    .button-login {
        width: 100%;
    }
}

.user-info-container {
    .user-info-area {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        border-bottom: 1px solid #666;
        padding-bottom: 10px;
        > .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            padding-left: 10px;
            > .profile {
                position: relative;
                img {
                    background-color: #666;
                }
                .sns-icon {
                    position: absolute;
                    bottom: 0;
                    right: -10px;
                }
            }
            > .user-name {
                padding-left: 5px;
            }
        }
        > .user-email {
            padding-left: 10px;
        }
        > .button-logout {
            width: 90%;
            margin: 0 auto;
        }
    }
}

.q-item.q-router-link--active,
.q-item--active {
    color: var(--color-secondary);
}
</style>
