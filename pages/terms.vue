<script setup lang="ts">
definePageMeta({
    title: '이용약관',
});

useSeoMeta({
    title: '이용약관 - 고고퀴즈킹(GoGo QuizKing)',
    description: '고고퀴즈킹 서비스 이용약관입니다.',
    ogTitle: '이용약관 - 고고퀴즈킹(GoGo QuizKing)',
    ogDescription: '고고퀴즈킹 서비스 이용약관을 확인하세요.',
});

const lastUpdated = '2026년 4월 5일';
</script>

<template>
    <q-page class="terms-page">
        <div class="terms-container">
            <header class="terms-header">
                <h1 class="terms-title">📜 이용약관</h1>
                <p class="terms-updated">최종 수정일: {{ lastUpdated }}</p>
            </header>

            <div class="terms-content">
                <section class="terms-section">
                    <h2>제1조 (목적)</h2>
                    <p>
                        이 약관은 고고퀴즈킹(이하 "서비스")이 제공하는 퀴즈 학습 플랫폼 서비스의
                        이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을
                        목적으로 합니다.
                    </p>
                </section>

                <section class="terms-section">
                    <h2>제2조 (정의)</h2>
                    <ol>
                        <li>
                            <strong>"서비스"</strong>란 고고퀴즈킹이 제공하는 퀴즈 생성, 풀이,
                            대결, 랭킹 등 모든 관련 서비스를 말합니다.
                        </li>
                        <li>
                            <strong>"회원"</strong>이란 본 약관에 동의하고 서비스에 가입한 자를
                            말합니다.
                        </li>
                        <li>
                            <strong>"콘텐츠"</strong>란 회원이 서비스 내에서 생성한 퀴즈, 댓글,
                            프로필 정보 등을 말합니다.
                        </li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제3조 (약관의 효력 및 변경)</h2>
                    <ol>
                        <li>
                            본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써
                            효력이 발생합니다.
                        </li>
                        <li>
                            회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할
                            수 있습니다.
                        </li>
                        <li>
                            변경된 약관은 공지사항을 통해 공지되며, 공지 후 7일이 경과한 후부터
                            효력이 발생합니다.
                        </li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제4조 (회원가입 및 이용자격)</h2>
                    <ol>
                        <li>
                            회원가입은 이용자가 본 약관에 동의하고, Google 또는 카카오 계정을 통해
                            가입함으로써 완료됩니다.
                        </li>
                        <li>본 서비스는 만 14세 미만의 아동도 이용할 수 있습니다.</li>
                        <li>
                            만 14세 미만 아동의 경우, 법정대리인(부모님)의 동의가 있는 것으로
                            간주합니다.
                        </li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제5조 (서비스의 제공)</h2>
                    <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                    <ol>
                        <li>퀴즈 생성 및 관리 서비스</li>
                        <li>퀴즈 풀이 및 학습 서비스</li>
                        <li>실시간 1:1 퀴즈 대결 서비스</li>
                        <li>포인트, 레벨, 뱃지 등 게이미피케이션 서비스</li>
                        <li>랭킹 및 통계 서비스</li>
                        <li>기타 회사가 정하는 서비스</li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제6조 (회원의 의무)</h2>
                    <ol>
                        <li>회원은 다음 행위를 하여서는 안 됩니다:</li>
                        <ul>
                            <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
                            <li>욕설, 비방, 차별, 혐오 표현 등 부적절한 콘텐츠를 게시하는 행위</li>
                            <li>서비스의 운영을 방해하거나 시스템에 부하를 주는 행위</li>
                            <li>저작권 등 타인의 지적재산권을 침해하는 행위</li>
                            <li>기타 관련 법령이나 사회 질서에 위반되는 행위</li>
                        </ul>
                        <li>
                            회원은 자신이 생성한 콘텐츠에 대해 책임을 지며, 해당 콘텐츠가 타인의
                            권리를 침해하지 않도록 해야 합니다.
                        </li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제7조 (콘텐츠의 관리)</h2>
                    <ol>
                        <li>
                            회원이 생성한 퀴즈, 댓글 등의 콘텐츠에 대한 저작권은 해당 회원에게
                            있습니다.
                        </li>
                        <li>
                            회사는 회원의 콘텐츠가 본 약관 또는 관련 법령에 위반된다고 판단되는 경우,
                            사전 통지 없이 해당 콘텐츠를 삭제하거나 비공개 처리할 수 있습니다.
                        </li>
                        <li>
                            회원은 자신의 콘텐츠를 서비스 내에서 다른 회원들이 이용할 수 있도록
                            허락한 것으로 간주합니다.
                        </li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제8조 (서비스 이용의 제한)</h2>
                    <ol>
                        <li>
                            회사는 다음의 경우 회원의 서비스 이용을 제한하거나 중지할 수 있습니다:
                        </li>
                        <ul>
                            <li>본 약관을 위반한 경우</li>
                            <li>서비스 운영을 고의로 방해한 경우</li>
                            <li>다른 회원에게 피해를 주는 행위를 한 경우</li>
                        </ul>
                        <li>이용 제한 시 회사는 회원에게 그 사유를 통지합니다.</li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제9조 (면책조항)</h2>
                    <ol>
                        <li>
                            회사는 천재지변, 시스템 장애 등 불가항력적인 사유로 인해 서비스를 제공할
                            수 없는 경우 책임이 면제됩니다.
                        </li>
                        <li>
                            회사는 회원이 서비스를 이용하여 얻은 정보나 자료의 정확성, 신뢰성에 대해
                            보증하지 않습니다.
                        </li>
                        <li>
                            회원 간 또는 회원과 제3자 사이에 발생한 분쟁에 대해 회사는 개입할 의무가
                            없습니다.
                        </li>
                    </ol>
                </section>

                <section class="terms-section">
                    <h2>제10조 (분쟁 해결)</h2>
                    <ol>
                        <li>
                            본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.
                        </li>
                        <li>
                            서비스 이용과 관련하여 발생한 분쟁에 대해서는 대한민국 법을 적용하며,
                            분쟁 발생 시 서울중앙지방법원을 관할 법원으로 합니다.
                        </li>
                    </ol>
                </section>

                <section class="terms-section terms-contact">
                    <h2>📧 문의하기</h2>
                    <p>약관에 대해 궁금한 점이 있으시면 아래로 연락해주세요:</p>
                    <ul>
                        <li>이메일: support@gogoquizking.net</li>
                    </ul>
                </section>
            </div>

            <footer class="terms-footer">
                <q-btn to="/" label="홈으로 돌아가기" icon="home" flat color="primary" />
            </footer>
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.terms-page {
    background: var(--bg-primary);
    min-height: 100vh;
}

.terms-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px;
}

.terms-header {
    text-align: center;
    margin-bottom: 32px;

    .terms-title {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px;
    }

    .terms-updated {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
    }
}

.terms-content {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px var(--shadow-color);
}

.terms-section {
    margin-bottom: 28px;

    &:last-child {
        margin-bottom: 0;
    }

    h2 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--color-primary);
    }

    p {
        font-size: 15px;
        line-height: 1.7;
        color: var(--text-secondary);
        margin: 0 0 12px;
    }

    ol,
    ul {
        padding-left: 20px;
        margin: 0;

        li {
            font-size: 15px;
            line-height: 1.7;
            color: var(--text-secondary);
            margin-bottom: 8px;

            strong {
                color: var(--text-primary);
            }
        }

        ul {
            margin-top: 8px;
        }
    }

    &.terms-contact {
        background: var(--bg-surface);
        padding: 16px;
        border-radius: 12px;
    }
}

.terms-footer {
    text-align: center;
    margin-top: 24px;
}
</style>

