import { lazy, Suspense, useEffect, useState } from "react";
import ArticleLoading from "./ArticleLoading.jsx";
import AISummary from "./AISummary.jsx";

const ArticleContent = lazy(() => import("./ArticleContent.jsx"));

export default function ArticleBody(props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer;
    // Give the panel, controls and title a paint before parsing a large body.
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(() => setReady(true), 0);
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);
  return (
    <Suspense fallback={<ArticleLoading />}>
      {ready ? (
        <>
          <AISummary articleId={props.article.id} />
          <ArticleContent {...props} />
        </>
      ) : (
        <ArticleLoading />
      )}
    </Suspense>
  );
}
