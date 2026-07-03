import fs from "fs"
import path from "path"
import matter from "gray-matter"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Navbar } from "@/components/homepage/navbar"

interface PostMeta {
    slug: string
    title: string
    date: string
    description: string
}

function getPosts(): PostMeta[] {
    const dir = path.join(process.cwd(), "public", "blog-content")
    if (!fs.existsSync(dir)) return []

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"))
    return files
        .map((file) => {
            const source = fs.readFileSync(path.join(dir, file), "utf-8")
            const { data } = matter(source)
            return {
                slug: file.replace(/\.md$/, ""),
                title: data.title || file,
                date: data.date || "",
                description: data.description || "",
            }
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function BlogPage() {
    const posts = getPosts()

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="mx-auto w-full max-w-2xl px-4 pt-24 pb-16">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Latest Updates
                </h1>

                <div className="mt-8 space-y-4">
                    {posts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No posts yet.</p>
                    ) : (
                        posts.map((post) => (
                            <Link key={post.slug} href={`/blog/${post.slug}`}>
                                <Card className="transition-colors hover:bg-card/80 bg-card ring-0 mb-4">
                                    <CardHeader>
                                        <CardTitle className="text-base">{post.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {post.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {post.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            {post.date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3.5" />
                                                    {new Date(post.date).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
