"use client"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeBlockProps {
    code: string
    language?: string
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
    return (
        <div className="overflow-hidden rounded-lg bg-card">
            <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "0.8125rem",
                    borderRadius: 0,
                    lineHeight: "1.6",
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    )
}
