# LLM NIKKE Theme Extension - Progress Tracker

## Current Phase: 완료
> Phase 1, 2, 3, 4, 5 완료 / 기존 Phase 5(마크다운) 삭제 (ChatGPT 렌더링 HTML 직접 활용으로 불필요)

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
<!-- - [ ] `src/content/stream-observer.js` - StreamObserver (현재 불필요 - VN 모드에서 직접 처리 중) -->
- [x] `src/modes/vn.js` - VNMode 클래스
- [x] `src/modes/vn.css` - VN 오버레이 스타일
- [x] `toggle.js` 업데이트 - VNMode 연동 (main.js에서 처리)
- [x] Composer 노출 수정 - body로 reparent + padding-bottom 동기화

---

## Phase 5: 설정, 퍼시스턴스, 폴리싱
- [x] `src/storage/image-store.js` - IndexedDB 이미지 저장 헬퍼
- [x] `service-worker.js` 업데이트 - 설정 CRUD (getSettings/setSettings/resetSettings)
- [x] `popup/` 업데이트 - 설정 UI (스피커명, 배경/캐릭터/프로필 이미지)
- [x] `vn.js` 업데이트 - 커스텀 설정 로드/적용, 프로필 아바타, 페이드인 애니메이션
- [x] `vn.css` 업데이트 - 아바타 스타일, 캐릭터 entrance 애니메이션
- [x] `manifest.json` 업데이트 - image-store.js content_scripts 등록
