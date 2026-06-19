export default {
  layout: "post.njk",
  tags: ["post"],
  eleventyComputed: {
    // 파일명에서 날짜를 뺀 슬러그가 URL이 됩니다: 2026-06-12-foo.md → /writings/foo/
    permalink: (data) => `/writings/${data.page.fileSlug}/`,
  },
};
