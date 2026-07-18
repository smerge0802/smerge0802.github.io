# Favicon K 변경 설계

## 목표

사이트 favicon에 표시되는 `R`을 `K`로 바꿔 Seungmin Kim의 이니셜과 일치시킨다.

## 변경 범위

- 대상 파일: `src/assets/favicon.svg`
- 검은색 둥근 사각형, 흰색 Georgia 이탤릭 글꼴, 크기와 위치는 유지한다.
- SVG의 텍스트 문자만 `R`에서 `K`로 교체한다.
- 다른 페이지 템플릿, CSS, 콘텐츠, 배포 설정은 변경하지 않는다.

## 검증 및 반영

- `npm run build`로 정적 사이트 빌드를 확인한다.
- 생성된 `_site/assets/favicon.svg`에 `K`가 포함되고 `R`이 남아 있지 않은지 확인한다.
- 변경사항을 Git에 커밋하고 `main` 브랜치의 원격 저장소에 push한다.
