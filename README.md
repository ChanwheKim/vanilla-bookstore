# Vanilla Bookstore

# Introduction
Naver Book Search API를 이용해 검색어를 입력하면, 관련 서적 리스트를 보여주는 웹 애플리케이션입니다.
<br>
![](vanilla-bookstore.gif)

## Setup

Install dependencies

```sh
$ yarn install (or npm install)
```

## Development

```sh
$ yarn dev (or npm run dev)
# visit http://localhost:8080
```

## Features

### 1. 책 검색창 보여주기

- 검색어를 입력하면 [Naver Book Search API](https://developers.naver.com/docs/search/book/)로부터 검색 결과를 가져와 보여줍니다.
- 검색어는 1글자 이상 20글자 이하(공백 포함) 입니다.
- 검색 데이터를 가져오는 동안에는 새로운 검색이 불가능 합니다.

### 2. 검색 결과 보여주기

Acceptance Criteria

- 기본적으로 리스트 형식이지만, 사용자가 카드 형식으로 볼 수 있도록 선택할 수 있습니다.
- 목록 최 하단에 "더보기" 버튼이 있어야 하고, "더보기"를 클릭할 경우, 그 다음 20개를 불러와 목록에 추가해주어야 합니다.
- 각 검색 결과는 아래의 항목들은 아래의 정보를 가지고 있습니다.
  - 책 제목
  - 작가 이름
  - 출판사 이름
  - 책 요약 정보
  - 출판일
  - 썸네일 이미지
  - 해당 검색 결과의 링크 단축 URL ([Naver URL Shortener API](https://developers.naver.com/docs/utils/shortenurl/) 이용)

## Tech
- Javascript
- HTML5
- CSS3
