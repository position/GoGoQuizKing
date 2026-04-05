<script setup lang="ts">
definePageMeta({
    title: '개인정보처리방침',
});

useSeoMeta({
    title: '개인정보처리방침 - 고고퀴즈킹(GoGo QuizKing)',
    description: '고고퀴즈킹 개인정보처리방침입니다.',
    ogTitle: '개인정보처리방침 - 고고퀴즈킹(GoGo QuizKing)',
    ogDescription: '고고퀴즈킹 개인정보처리방침을 확인하세요.',
});

const lastUpdated = '2026년 4월 5일';
</script>

<template>
    <q-page class="privacy-page">
        <div class="privacy-container">
            <header class="privacy-header">
                <h1 class="privacy-title">🔒 개인정보처리방침</h1>
                <p class="privacy-updated">최종 수정일: {{ lastUpdated }}</p>
            </header>

            <div class="privacy-content">
                <section class="privacy-section">
                    <h2>제1조 (개인정보의 수집 및 이용 목적)</h2>
                    <p>
                        고고퀴즈킹(이하 "서비스")은 다음의 목적을 위하여 개인정보를 수집 및
                        이용합니다. 수집한 개인정보는 다음의 목적 이외의 용도로는 이용되지
                        않으며, 이용 목적이 변경될 경우 사전에 동의를 구합니다.
                    </p>
                    <ol>
                        <li>
                            <strong>회원 가입 및 관리</strong>: 회원 식별, 가입의사 확인, 서비스
                            제공, 회원자격 유지 및 관리
                        </li>
                        <li>
                            <strong>서비스 제공</strong>: 퀴즈 생성 및 풀이, 대결 매칭, 랭킹
                            산정, 포인트/뱃지 관리
                        </li>
                        <li>
                            <strong>서비스 개선</strong>: 서비스 이용 통계, 맞춤 서비스 제공,
                            새로운 기능 개발
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제2조 (수집하는 개인정보 항목)</h2>
                    <p>서비스는 다음과 같은 개인정보를 수집합니다:</p>
                    <ol>
                        <li>
                            <strong>필수 항목</strong>
                            <ul>
                                <li>소셜 로그인 정보 (Google/카카오): 이메일, 이름, 프로필 사진</li>
                                <li>서비스 이용 기록: 퀴즈 풀이 기록, 대결 기록, 포인트 내역</li>
                            </ul>
                        </li>
                        <li>
                            <strong>선택 항목</strong>
                            <ul>
                                <li>닉네임, 프로필 이미지, 학년 정보</li>
                            </ul>
                        </li>
                        <li>
                            <strong>자동 수집 항목</strong>
                            <ul>
                                <li>접속 IP, 브라우저 정보, 서비스 이용 기록, 접속 로그</li>
                            </ul>
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
                    <ol>
                        <li>
                            서비스는 회원 탈퇴 시까지 개인정보를 보유하며, 탈퇴 즉시 해당 정보를
                            파기합니다.
                        </li>
                        <li>
                            단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다:
                            <ul>
                                <li>
                                    계약 또는 청약철회에 관한 기록: 5년 (전자상거래법)
                                </li>
                                <li>
                                    접속에 관한 기록: 3개월 (통신비밀보호법)
                                </li>
                            </ul>
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제4조 (개인정보의 제3자 제공)</h2>
                    <p>
                        서비스는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 다만,
                        다음의 경우에는 예외로 합니다:
                    </p>
                    <ol>
                        <li>회원이 사전에 동의한 경우</li>
                        <li>법령에 의해 요구되는 경우</li>
                        <li>
                            서비스 제공에 필요한 경우 (예: 결제 처리, 본인 인증 등) - 현재
                            해당사항 없음
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제5조 (개인정보의 파기)</h2>
                    <ol>
                        <li>
                            서비스는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우,
                            지체 없이 해당 개인정보를 파기합니다.
                        </li>
                        <li>
                            파기 방법:
                            <ul>
                                <li>
                                    전자적 파일: 복구 불가능한 방법으로 영구 삭제
                                </li>
                                <li>
                                    기록물: 분쇄기로 분쇄하거나 소각
                                </li>
                            </ul>
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제6조 (회원의 권리와 행사 방법)</h2>
                    <p>회원은 다음과 같은 권리를 행사할 수 있습니다:</p>
                    <ol>
                        <li>
                            <strong>개인정보 열람권</strong>: 본인의 개인정보 처리 현황 열람
                            요청
                        </li>
                        <li>
                            <strong>개인정보 정정권</strong>: 부정확한 개인정보의 정정 요청
                        </li>
                        <li>
                            <strong>개인정보 삭제권</strong>: 개인정보의 삭제 요청 (단, 법령에
                            따른 보존 의무가 있는 경우 제외)
                        </li>
                        <li>
                            <strong>처리정지권</strong>: 개인정보 처리의 정지 요청
                        </li>
                    </ol>
                    <p>
                        위 권리는 프로필 설정 페이지 또는 이메일(support@gogoquizking.net)을 통해
                        행사할 수 있습니다.
                    </p>
                </section>

                <section class="privacy-section">
                    <h2>제7조 (개인정보의 안전성 확보 조치)</h2>
                    <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
                    <ol>
                        <li>
                            <strong>관리적 조치</strong>: 내부 관리계획 수립 및 시행, 정기적
                            직원 교육
                        </li>
                        <li>
                            <strong>기술적 조치</strong>: 개인정보 암호화, 보안 프로그램 설치,
                            접근 권한 관리
                        </li>
                        <li>
                            <strong>물리적 조치</strong>: 전산실 및 자료 보관실 접근 통제
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제8조 (쿠키의 사용)</h2>
                    <ol>
                        <li>
                            서비스는 사용자 경험 개선을 위해 쿠키를 사용합니다.
                        </li>
                        <li>
                            쿠키의 용도:
                            <ul>
                                <li>로그인 상태 유지</li>
                                <li>사용자 설정 저장 (다크모드 등)</li>
                                <li>서비스 이용 통계 분석</li>
                            </ul>
                        </li>
                        <li>
                            회원은 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우
                            서비스 이용에 제한이 있을 수 있습니다.
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제9조 (아동의 개인정보 보호)</h2>
                    <ol>
                        <li>
                            서비스는 만 14세 미만 아동의 개인정보를 수집할 수 있으며, 이 경우
                            법정대리인(부모님)의 동의가 있는 것으로 간주합니다.
                        </li>
                        <li>
                            아동의 개인정보는 학습 서비스 제공 목적으로만 사용되며, 특별히
                            보호됩니다.
                        </li>
                        <li>
                            법정대리인은 아동의 개인정보에 대한 열람, 정정, 삭제를 요청할 수
                            있습니다.
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제10조 (개인정보 처리방침의 변경)</h2>
                    <ol>
                        <li>
                            본 개인정보처리방침은 관련 법령이나 서비스 정책 변경에 따라 수정될 수
                            있습니다.
                        </li>
                        <li>
                            변경 시에는 최소 7일 전에 공지사항을 통해 안내합니다.
                        </li>
                        <li>
                            중요한 변경사항의 경우 이메일 또는 서비스 내 알림으로 개별
                            안내합니다.
                        </li>
                    </ol>
                </section>

                <section class="privacy-section">
                    <h2>제11조 (개인정보 보호책임자)</h2>
                    <p>
                        서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와
                        관련한 정보주체의 불만처리 및 피해구제를 위해 아래와 같이 개인정보
                        보호책임자를 지정하고 있습니다.
                    </p>
                    <ul>
                        <li><strong>개인정보 보호책임자</strong>: 고고퀴즈킹 운영팀</li>
                        <li><strong>이메일</strong>: support@gogoquizking.net</li>
                    </ul>
                </section>

                <section class="privacy-section privacy-contact">
                    <h2>📧 문의하기</h2>
                    <p>개인정보처리방침에 대해 궁금한 점이 있으시면 아래로 연락해주세요:</p>
                    <ul>
                        <li>이메일: support@gogoquizking.net</li>
                    </ul>
                    <p class="privacy-note">
                        기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에
                        문의하세요:
                    </p>
                    <ul>
                        <li>
                            개인정보침해신고센터:
                            <a href="https://privacy.kisa.or.kr" target="_blank" rel="noopener">
                                privacy.kisa.or.kr
                            </a>
                        </li>
                        <li>
                            대검찰청 사이버수사과:
                            <a href="https://www.spo.go.kr" target="_blank" rel="noopener">
                                spo.go.kr
                            </a>
                        </li>
                        <li>
                            경찰청 사이버안전국:
                            <a href="https://cyberbureau.police.go.kr" target="_blank" rel="noopener">
                                cyberbureau.police.go.kr
                            </a>
                        </li>
                    </ul>
                </section>
            </div>

            <footer class="privacy-footer">
                <q-btn to="/" label="홈으로 돌아가기" icon="home" flat color="primary" />
            </footer>
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.privacy-page {
    background: var(--bg-primary);
    min-height: 100vh;
}

.privacy-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px;
}

.privacy-header {
    text-align: center;
    margin-bottom: 32px;

    .privacy-title {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 8px;
    }

    .privacy-updated {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
    }
}

.privacy-content {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px var(--shadow-color);
}

.privacy-section {
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

            a {
                color: var(--color-primary);
                text-decoration: none;

                &:hover {
                    text-decoration: underline;
                }
            }
        }

        ul {
            margin-top: 8px;
        }
    }

    &.privacy-contact {
        background: var(--bg-surface);
        padding: 16px;
        border-radius: 12px;

        .privacy-note {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid var(--border-color);
        }
    }
}

.privacy-footer {
    text-align: center;
    margin-top: 24px;
}
</style>

