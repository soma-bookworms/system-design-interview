# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript + motion (framer-motion)

## Users

스터디 그룹 발표자.
프로젝터/TV 앞에서 안정 해시(consistent hashing) 개념을 설명하며, 키보드로 페이지를 넘기고 서버/키를 추가하며 시연한다.
청중은 화면을 보기만 한다.

## Product Purpose

안정 해시의 핵심 개념을 시각적으로 보여주는 발표용 데모 도구.
해시 공간이 링으로 접히는 과정, 서버와 키 배치, 키 조회, 서버 변동 시 재배치, 가상 노드를 단계별로 시연한다.

## Capabilities and Constraints

- 6페이지 구성, 키보드 좌우 화살표로 전환
- 페이지 간 상태 유지
- 서버 최대 5대, 서버당 가상 노드 1~5개
- 키 개수 제한 없음, 랜덤 생성
- 해시 함수: SHA-1, 결과를 0~360도로 매핑
- 로컬 실행 전용
- 프로젝터/TV 출력: 먼 거리에서도 읽히는 크기와 대비 필요
- 스크롤 없음, 각 페이지가 뷰포트를 채움
