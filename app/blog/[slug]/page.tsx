import fs from "fs"
import path from "path"
import matter from "gray-matter"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/homepage/markdown-render"
import { Navbar } from "@/components/homepage/navbar"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const dir = path.join(process.cwd(), "public", "blog-content")
    if (!fs.existsSync(dir)) return []

    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((file) => ({ slug: file.replace(/\.md$/, "") }))
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params
    const filePath = path.join(process.cwd(), "public", "blog-content", `${slug}.md`)

    if (!fs.existsSync(filePath)) notFound()

    const source = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(source)

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="mx-auto w-full max-w-2xl px-4 pt-24 pb-16">
                <div className="mb-2">
                    <Button variant="ghost" className="text-muted-foreground" size="sm" asChild>
                        <Link href="/blog" className="gap-1.5">
                            Go back
                        </Link>
                    </Button>
                </div>

                <article>
                    <header className="mb-8 space-y-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {data.title || slug}
                        </h1>
                        {data.description && (
                            <p className="text-sm text-muted-foreground">
                                {data.description}
                            </p>
                        )}
                        {data.date && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="size-3.5" />
                                {new Date(data.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                        )}
                    </header>

                    <MarkdownRenderer content={content} />
                </article>
            </div>
        </div>
    )
}
