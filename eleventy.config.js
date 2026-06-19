import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  // PATH_PREFIX lets the same build work for a user page and a project page.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/assets": "assets" });

  eleventyConfig.addFilter("readableDate", (value) =>
    new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    })
  );
  eleventyConfig.addFilter("shortDate", (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    })
  );
  eleventyConfig.addFilter("isoDate", (value) => new Date(value).toISOString().slice(0, 10));
  eleventyConfig.addFilter("year", (value) => new Date(value).getUTCFullYear());

  eleventyConfig.addCollection("posts", (collection) =>
    collection.getFilteredByGlob("src/writings/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    // Keep .md files plain markdown (no Nunjucks preprocessing) so code blocks
    // containing {{ }} or {% %} — common in security writeups — never break a build.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
