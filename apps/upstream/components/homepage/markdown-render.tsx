"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { Components } from "react-markdown"

interface Props {
    content: string
}

const components: Components = {
    code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "")
        const code = String(children).replace(/\n$/, "")

        if (match) {
            return (
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "0.8125rem",
                        borderRadius: 0,
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            )
        }

        return (
            <code
                className="rounded bg-muted px-1.5 py-0.5 text-sm font-medium text-foreground"
                {...props}
            >
                {children}
            </code>
        )
    },
    pre({ children }) {
        return (
            <div className="my-4 overflow-hidden rounded-lg border border-border bg-muted/40">
                {children}
            </div>
        )
    },
    h1({ children }) {
        return (
            <h1 className="mb-4 mt-8 text-2xl font-bold tracking-tight text-foreground first:mt-0">
                {children}
            </h1>
        )
    },
    h2({ children }) {
        return (
            <h2 className="mb-3 mt-8 text-xl font-semibold tracking-tight text-foreground">
                {children}
            </h2>
        )
    },
    h3({ children }) {
        return (
            <h3 className="mb-2 mt-6 text-lg font-semibold tracking-tight text-foreground">
                {children}
            </h3>
        )
    },
    p({ children }) {
        return <p className="mb-4 leading-relaxed text-muted-foreground last:mb-0">{children}</p>
    },
    ul({ children }) {
        return <ul className="mb-4 ml-6 list-disc space-y-1 text-muted-foreground">{children}</ul>
    },
    ol({ children }) {
        return <ol className="mb-4 ml-6 list-decimal space-y-1 text-muted-foreground">{children}</ol>
    },
    li({ children }) {
        return <li className="leading-relaxed">{children}</li>
    },
    blockquote({ children }) {
        return (
            <blockquote className="my-4 border-l-2 border-primary pl-4 italic text-muted-foreground">
                {children}
            </blockquote>
        )
    },
    a({ href, children }) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 transition-colors hover:text-muted-foreground/80"
            >
                {children}
            </a>
        )
    },
    hr() {
        return <hr className="my-8 border-border" />
    },
    table({ children }) {
        return (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse text-sm">{children}</table>
            </div>
        )
    },
    thead({ children }) {
        return <thead className="bg-muted/40">{children}</thead>
    },
    th({ children }) {
        return (
            <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                {children}
            </th>
        )
    },
    td({ children }) {
        return (
            <td className="border-t border-border px-3 py-2 text-muted-foreground">
                {children}
            </td>
        )
    },
    strong({ children }) {
        return <strong className="font-semibold text-foreground">{children}</strong>
    },
    em({ children }) {
        return <em className="italic">{children}</em>
    },
}

export function MarkdownRenderer({ content }: Props) {
    return (
        <div className="prose-custom">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    )
}
