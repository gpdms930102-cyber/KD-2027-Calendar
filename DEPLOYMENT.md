# KD 2027 CALENDAR 배포 안내

## 현재 배포 상태 (2026-09-20)
- 공개 주소: https://kd-2027-calendar.vercel.app/
- 관리 화면: https://vercel.com/kd-2027-calendar/kd-2027-calendar
- 사용자가 선택한 Hobby 요금제로 ZIP 직접 업로드 배포 완료.
- GitHub 저장소: https://github.com/gpdms930102-cyber/KD-2027-Calendar
- Vercel에 GitHub 저장소 연결 완료. main 브랜치에 올린 변경 사항이 자동 배포됩니다.

## 전체 흐름
GitHub에 사이트 파일 보관 → Vercel에 GitHub 저장소 연결 → 웹사이트 주소 발급.
이후 GitHub의 main 브랜치가 갱신되면 Vercel이 변경 사항을 자동 배포합니다.

## 저장소
- 이름: kd-2027-calendar
- 기본 권장 공개 범위: Private (사이트는 공개하되 소스는 비공개 보관)
- calendar-responsive 폴더 내용만 업로드합니다. 바깥의 원본 PDF, Illustrator 파일, ZIP은 제외합니다.

## Vercel 가져오기 설정
- Add New → Project → GitHub의 kd-2027-calendar 저장소 Import
- Project Name: kd-2027-calendar
- Framework Preset: Other
- Root Directory: ./
- Build Command: node scripts/build.mjs
- Output Directory: dist
- 환경변수: 필요 없음
- 위 설정은 vercel.json에 준비되어 있습니다.
- 주소는 배포 완료 후 Vercel이 발급합니다. 정확한 주소는 성공 화면에서 확인합니다.

## 계정과 요금
GitHub 계정이 이미 연결되어 있습니다. Vercel은 Google 로그인으로 진행할 수 있습니다.
회사 홍보용 사이트에는 Vercel의 비상업 개인용 Hobby 요금제를 사용할 수 없으므로 Pro 등 적합한 요금제를 선택해야 합니다. 유료 요금제 선택과 결제는 계정 소유자가 확인한 뒤 진행합니다.
공식 안내: https://vercel.com/docs/plans/hobby

## 검증과 결과물
동영상·카드 이미지·폰트가 모두 포함됩니다. 메시지는 브라우저에서만 처리됩니다.
로컬 빌드는 node scripts/build.mjs 로 검증하며 dist 폴더가 실제 배포 내용입니다.
