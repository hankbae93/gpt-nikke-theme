# LLM NIKKE Theme Extension - Progress Tracker

## Current Phase: Phase 4 - Stream Observer + VN 모드
> Phase 1, 2, 3 완료

---

## Phase 1: Skeleton Extension
**목표**: Chrome에 로드 가능한 확장 프로그램 + ChatGPT에 플로팅 토글 버튼 표시

- [x] `manifest.json` - MV3 manifest
- [x] `src/content/main.js` - 진입점
- [x] `src/ui/toggle.js` + `toggle.css` - 플로팅 토글 버튼
- [x] `src/background/service-worker.js` - 모드 상태 저장
- [x] `popup/popup.html` + `popup.js` + `popup.css` - 기본 팝업

**검증**: chrome://extensions 로드 -> chatgpt.com -> 토글 버튼 확인

---

## Phase 2: Adapter Pattern + ChatGPT DOM 감지
- [x] `src/adapters/base.js` - LLMAdapter 베이스 클래스
- [x] `src/adapters/chatgpt.js` - ChatGPT 셀렉터
- [x] `src/adapters/registry.js` - 어댑터 매칭
- [x] `main.js` 업데이트 - 어댑터 연동

---

## Phase 3: Chatting 모드
- [x] `src/modes/chatting.js` - ChattingMode 클래스
- [x] `src/modes/chatting.css` - 테마 스타일 (블라블라 기반)
- [x] `main.js` 업데이트 - ChattingMode 연동
- [x] 블라블라 에셋 복사 (`assets/blabla/`)

---

## Phase 4: Stream Observer + VN 모드
- [ ] `src/content/stream-observer.js` - StreamObserver
- [x] `src/modes/vn.js` - VNMode 클래스
- [x] `src/modes/vn.css` - VN 오버레이 스타일
- [x] `toggle.js` 업데이트 - VNMode 연동 (main.js에서 처리)
- [x] Composer 노출 수정 - body로 reparent + padding-bottom 동기화

---

## Phase 5: 마크다운 렌더링 + 적응형 콘텐츠
- [ ] `lib/marked.min.js` - 마크다운 라이브러리 번들
- [ ] `src/content/markdown-renderer.js` - marked.js 래퍼
- [ ] `vn.js` 업데이트 - 마크다운 렌더링 + 적응형 레이아웃
- [ ] `vn.css` 업데이트 - 마크다운 스타일

---

## Phase 6: 설정, 퍼시스턴스, 폴리싱
- [ ] `src/ui/settings-panel.js` - 설정 패널
- [ ] `service-worker.js` 업데이트 - 설정 CRUD
- [ ] `popup/` 업데이트
- [ ] 폴리싱 (SPA 대응, 다크모드, 애니메이션)
