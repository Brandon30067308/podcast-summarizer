import Markdown from "markdown-to-jsx";
import { memo } from "react";

import { cn } from "@/lib/utils";

export const MemoizedMarkdownToJsx: React.FC<{ content: string }> = memo(
  ({ content }) => <Markdown>{content}</Markdown>,
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownToJsx.displayName = "MemoizedMarkdownToJsx";

export default function MarkdownRenderer({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;

  return (
    <Markdown
      options={{
        overrides: {
          ul: {
            component: (props) => (
              <ul className="mb-1 list-disc last:mb-0" {...props} />
            ),
          },
          ol: {
            component: (props) => (
              <ol className="mb-1 list-decimal last:mb-0" {...props} />
            ),
          },
          li: {
            component: (props) => <li className="mb-1 last:mb-0" {...props} />,
          },
          h1: {
            component: (props) => (
              <h1
                className="mt-1 mb-2 text-lg font-bold last:mb-0"
                {...props}
              />
            ),
          },
          h2: {
            component: (props) => (
              <h2
                className="mt-1 mb-2 text-base font-bold last:mb-0"
                {...props}
              />
            ),
          },
          h3: {
            component: (props) => (
              <h3
                className="mt-1 mb-2 text-sm font-bold last:mb-0 sm:text-[15px]"
                {...props}
              />
            ),
          },
          p: {
            component: (props) => (
              <p className="mb-2 text-sm last:mb-0 sm:text-[15px]" {...props} />
            ),
          },
          span: {
            component: (props) => (
              <span className="text-sm sm:text-[15px]" {...props} />
            ),
          },
          strong: {
            component: (props) => (
              <strong className="font-semibold" {...props} />
            ),
          },
        },
      }}
      className={cn("space-y-4 text-sm sm:text-[15px]", className)}
    >
      {content}
    </Markdown>
  );
}
