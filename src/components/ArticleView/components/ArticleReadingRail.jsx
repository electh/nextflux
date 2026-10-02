import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion.js";
import "./ArticleReadingRail.css";

export default function ArticleReadingRail({ article, scrollAreaRef }) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [sections, setSections] = useState([]);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(null);
  const [previewTop, setPreviewTop] = useState(0);
  const railRef = useRef(null);
  const ticksRef = useRef(null);
  const tickRefs = useRef([]);

  useEffect(() => {
    if (preview !== null) return;
    const tick = tickRefs.current[active];
    const ticks = ticksRef.current;
    if (!tick || !ticks) return;
    const offset = tick.offsetTop;
    if (
      offset < ticks.scrollTop ||
      offset + tick.offsetHeight > ticks.scrollTop + ticks.clientHeight
    ) {
      ticks.scrollTo({
        top: Math.max(0, offset - ticks.clientHeight / 2),
        behavior: "instant",
      });
    }
  }, [active, preview, sections]);

  useEffect(() => {
    const viewport = scrollAreaRef.current;
    if (!viewport) return;
    let entries = [];
    let frame;
    const updatePosition = () => {
      frame = undefined;
      const readingLine = viewport.getBoundingClientRect().top + 120;
      let index = 0;
      entries.forEach(({ element }, position) => {
        if (element.getBoundingClientRect().top <= readingLine)
          index = position;
      });
      if (
        viewport.scrollTop > 0 &&
        viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2
      ) {
        index = entries.length - 1;
      }
      setActive(Math.max(0, index));
    };
    const schedulePosition = () => {
      if (frame === undefined) frame = requestAnimationFrame(updatePosition);
    };
    const resize = new ResizeObserver(schedulePosition);
    resize.observe(viewport);
    const collect = () => {
      const body = viewport.querySelector(".article-content");
      if (!body) return;
      resize.disconnect();
      resize.observe(viewport);
      resize.observe(body);
      let heading = article.title;
      entries = Array.from(
        body.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, pre, blockquote"),
      )
        .filter(
          (element) => !element.parentElement.closest("p, li, pre, blockquote"),
        )
        .flatMap((element) => {
          const text = element.textContent.replace(/\s+/g, " ").trim();
          if (!text) return [];
          const isHeading = /^H[1-6]$/.test(element.tagName);
          if (isHeading) heading = text;
          const excerpt = [];
          let node = isHeading ? element.nextElementSibling : element;
          for (let count = 0; node && count < 3; count += 1) {
            if (/^H[1-6]$/.test(node.tagName)) break;
            const text = node.textContent.replace(/\s+/g, " ").trim();
            if (text) {
              excerpt.push({
                type: node.tagName === "BLOCKQUOTE" ? "quote" : "text",
                text: text.slice(0, 500),
              });
            }
            node = node.nextElementSibling;
          }
          return [
            {
              element,
              title: heading,
              excerpt: excerpt.length ? excerpt : [{ type: "text", text }],
              isHeading,
            },
          ];
        });
      setSections(entries);
      setPreview(null);
      schedulePosition();
    };
    collect();
    // The body is lazy rendered, and can be replaced by fetched full text.
    const mutations = new MutationObserver((records) => {
      const bodyChanged = records.some(
        (record) =>
          record.target.closest?.(".article-content") ||
          [...record.addedNodes, ...record.removedNodes].some(
            (node) =>
              node.nodeType === 1 &&
              (node.matches(".article-content") ||
                node.querySelector(".article-content")),
          ),
      );
      if (bodyChanged) collect();
    });
    mutations.observe(viewport, { childList: true, subtree: true });
    viewport.addEventListener("scroll", schedulePosition, { passive: true });
    return () => {
      mutations.disconnect();
      resize.disconnect();
      viewport.removeEventListener("scroll", schedulePosition);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [article.id, article.content, article.title, scrollAreaRef]);

  if (sections.length < 2) return null;
  const selected = preview === null ? null : sections[preview];
  const highlight = preview ?? active;
  const showPreview = (index) => {
    const tick = tickRefs.current[index];
    const rail = railRef.current;
    if (!tick || !rail) return;
    const tickRect = tick.getBoundingClientRect();
    setPreviewTop(
      tickRect.top + tickRect.height / 2 - rail.getBoundingClientRect().top,
    );
    setPreview(index);
  };
  const jumpTo = (index) => {
    const viewport = scrollAreaRef.current;
    const element = sections[index]?.element;
    if (!viewport || !element) return;
    viewport.scrollTo({
      top:
        viewport.scrollTop +
        element.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        100,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  };

  return (
    <nav
      ref={railRef}
      className="article-reading-rail"
      aria-label={t("articleView.readingNavigation")}
      onMouseLeave={() => setPreview(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPreview(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setPreview(null);
        }
      }}
    >
      <div
        ref={ticksRef}
        className="article-reading-ticks"
        onScroll={() => setPreview(null)}
      >
        {sections.map((section, index) => (
          <button
            key={index}
            ref={(element) => {
              tickRefs.current[index] = element;
            }}
            type="button"
            tabIndex={index === active ? 0 : -1}
            className={cn(
              "article-reading-tick",
              section.isHeading && "is-heading",
              index === highlight && "is-active",
            )}
            style={{
              "--tick-width": `${[36, 28, 20, 14][Math.abs(index - highlight)] ?? 8}px`,
            }}
            aria-label={t("articleView.jumpToSection", {
              index: index + 1,
              title: section.title,
            })}
            aria-current={index === active ? "location" : undefined}
            onMouseEnter={() => showPreview(index)}
            onFocus={() => showPreview(index)}
            onClick={() => jumpTo(index)}
            onKeyDown={(event) => {
              const offsets = {
                ArrowDown: 1,
                ArrowUp: -1,
                Home: -sections.length,
                End: sections.length,
              };
              if (!(event.key in offsets)) return;
              event.preventDefault();
              tickRefs.current[
                Math.max(
                  0,
                  Math.min(sections.length - 1, index + offsets[event.key]),
                )
              ]?.focus();
            }}
          >
            <span />
          </button>
        ))}
      </div>
      {selected && (
        <div
          className="article-reading-preview shadow-custom-md"
          style={{ top: previewTop }}
        >
          <h2 className="article-reading-preview-title">{selected.title}</h2>
          <div className="article-reading-preview-text">
            {selected.excerpt.map((block, index) =>
              block.type === "quote" ? (
                <blockquote key={index}>{block.text}</blockquote>
              ) : (
                <p key={index}>{block.text}</p>
              ),
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
