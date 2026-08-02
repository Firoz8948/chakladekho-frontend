import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const source = (relativePath) =>
  readFile(path.join(root, relativePath), "utf8");

test("admin greeting, identity, and navigation match the requested content", async () => {
  const [layout, sidebar] = await Promise.all([
    source("app/admin/layout.jsx"),
    source("components/AdminSidebar/AdminSidebar.jsx"),
  ]);

  assert.match(layout, /Welcome Vikram Bhai/);
  assert.doesNotMatch(layout, /Welcome Mohan Bhai/);
  assert.match(sidebar, />ChaklaDekho</);
  assert.match(sidebar, />Admin</);

  const expectedOrder = [
    "Dashboard",
    "Banner",
    "Category",
    "Products",
    "Metafields",
    "Video Products",
    "Promo Codes",
    "Orders",
    "Payments",
    "Users",
    "Setting",
    "Profile",
  ];
  const orderSource = sidebar.match(/const NAV_ORDER = \[([\s\S]*?)\];/)?.[1] || "";
  const actualOrder = [...orderSource.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(actualOrder, expectedOrder);
});

test("admin category actions stay anchored to the bottom of every card", async () => {
  const css = await source("app/admin/categories/categories.module.css");

  assert.match(css, /\.card\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.cardBody\s*\{[^}]*flex:\s*1/s);
  assert.match(css, /\.cardActions\s*\{[^}]*margin-top:\s*auto/s);
});

test("brand contact details and map use the requested location", async () => {
  const constants = await source("utils/constants.js");

  assert.match(constants, /\+91 96991 64131/);
  assert.match(
    constants,
    /Umadevi mandir, Umrale, Samel Pada, Nalasopara West, Vasai-Virar, Maharashtra 401203/,
  );
  assert.match(constants, /https:\/\/maps\.app\.goo\.gl\/6vu33aYvzsYzrq4YA/);
});

test("footer uses a brown logo treatment, warm layers, and animated link underlines", async () => {
  const css = await source("components/Footer/Footer.module.css");

  assert.match(css, /filter:[^;]*sepia/i);
  assert.match(css, /\.logoPlate\s*\{[^}]*background:\s*var\(--background\)/s);
  assert.match(css, /\.col a::after\s*\{/);
  assert.match(css, /\.col a:hover::after[\s\S]*scaleX\(1\)/);
  assert.match(css, /\.social a svg\s*\{[^}]*fill:\s*currentColor/s);
  assert.doesNotMatch(css, /\.footer\s*\{[^}]*background:\s*var\(--bg-dark\)/s);
});

test("shop desktop layout can extend wider and pull the sidebar left", async () => {
  const [page, css] = await Promise.all([
    source("app/shop/page.jsx"),
    source("app/shop/shop.module.css"),
  ]);

  assert.match(page, /styles\.shopContainer/);
  assert.match(css, /\.shopContainer\s*\{[^}]*max-width:/s);
  assert.match(css, /\.shopLayout\s*\{[^}]*grid-template-columns:\s*280px/s);
});

test("about journey section uses the brand logo in a redesigned editorial layout", async () => {
  const [component, css] = await Promise.all([
    source("pages-components/about/OurStory.jsx"),
    source("pages-components/about/OurStory.module.css"),
  ]);

  assert.match(component, /src=\{ASSETS\.logo\}/);
  assert.match(component, /className=\{styles\.logoArtwork\}/);
  assert.match(css, /\.logoStage\s*\{/);
  assert.match(css, /\.contentPanel\s*\{/);
});

test("footer social icons stay white without brown icon fill", async () => {
  const css = await source("components/Footer/Footer.module.css");

  assert.match(css, /\.social a\s*\{[^}]*color:\s*var\(--text-light\)/s);
  assert.match(css, /\.social a svg\s*\{[^}]*fill:\s*currentColor/s);
  assert.doesNotMatch(css, /\.social a svg\s*\{[^}]*var\(--primary\)/s);
});

test("desktop About navigation belongs to the aligned right-side group", async () => {
  const [component, css] = await Promise.all([
    source("components/Navbar/Navbar.jsx"),
    source("components/Navbar/Navbar.module.css"),
  ]);

  assert.match(
    component,
    /className=\{styles\.desktopRight\}[\s\S]*href="\/about"[\s\S]*className=\{styles\.search\}/,
  );
  assert.match(
    css,
    /@media \(min-width: 861px\)[\s\S]*?\.desktopRight\s*\{[^}]*display:\s*flex/s,
  );
  assert.doesNotMatch(css, /\.aboutDesktop\s*\{[^}]*position:\s*absolute/s);
});

test("about logo artwork does not show the decorative 01 number", async () => {
  const [component, css] = await Promise.all([
    source("pages-components/about/OurStory.jsx"),
    source("pages-components/about/OurStory.module.css"),
  ]);

  assert.doesNotMatch(component, /stageNumber|>01</);
  assert.doesNotMatch(css, /\.stageNumber\s*\{/);
});

test("Instagram stays an outlined white icon", async () => {
  const [component, css] = await Promise.all([
    source("components/Footer/Footer.jsx"),
    source("components/Footer/Footer.module.css"),
  ]);

  assert.match(component, /<FiInstagram className=\{styles\.outlineSocialIcon\}/);
  assert.match(
    css,
    /\.social a \.outlineSocialIcon\s*\{[^}]*fill:\s*none;[^}]*stroke:\s*currentColor;/s,
  );
});

test("desktop navbar row is pinned to the header height so the tall logo cannot push items down", async () => {
  const css = await source("components/Navbar/Navbar.module.css");
  const desktop = css.match(
    /@media \(min-width: 861px\) \{([\s\S]*?)\n\}\s*\.navDesktop/,
  )?.[1];

  assert.ok(desktop, "expected the desktop media query block");

  // The 86px logo lives in this row; an auto-sized row would grow past the
  // 60px bar and drag every grid item below the visual centre.
  assert.match(desktop, /\.inner\s*\{[^}]*grid-template-rows:\s*60px;/s);
  assert.match(desktop, /\.inner\s*\{[^}]*align-items:\s*center;/s);

  for (const group of ["logo", "desktopNavWrap", "desktopRight"]) {
    assert.match(
      desktop,
      new RegExp(`\\.${group}\\s*\\{[^}]*align-self:\\s*center;`, "s"),
    );
  }

  assert.doesNotMatch(desktop, /align-self:\s*stretch;/);
  assert.doesNotMatch(desktop, /height:\s*100%;/);
  assert.doesNotMatch(desktop, /transform:\s*translateY\(-4px\)/);
});

test("desktop navbar has no leftover full-height or flex-basis sizing hacks", async () => {
  const css = await source("components/Navbar/Navbar.module.css");

  assert.doesNotMatch(css, /\.navDesktop\s*\{[^}]*height:\s*100%;/s);
  assert.doesNotMatch(css, /\.desktopNavWrap\s*\{[^}]*flex:\s*0 0 calc\(/s);
});
