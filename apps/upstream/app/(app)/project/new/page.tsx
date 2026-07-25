"use client"

// Libraries
import axios from "axios"
import { authClient } from "@/client/auth"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Components
import { Button } from "@uplabs/ui/components/button"
import { Input } from "@uplabs/ui/components/input"
import { Label } from "@uplabs/ui/components/label"
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@uplabs/ui/components/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@uplabs/ui/components/breadcrumb"

import { Form } from "@/components/form"
import { PageLayout } from "@/components/layout"

// Types
type FormProps = {
    projectName: string
}

export default function Page() {
    const { data: session, isPending } = authClient.useSession()
    const [creating, isCreating] = useState(false)

    const router = useRouter()

    if (isPending || !session) return null

    async function newProject(name: string) {
        isCreating(true)

        try {
            await axios.post("/api/project", {
                name
            }).then(async (res) => {
                toast.success("Your new project has been created.")
                await router.push(`/project/${res.data.projectId}`)
            })

        } catch (error) {
            console.error(error)
        } finally {
            isCreating(false)
        }
    }

    return (
        <PageLayout>
            <div className="flex flex-col gap-1">
                <Breadcrumb>
                    <BreadcrumbList className="text-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Create Project</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Form<FormProps>
                onSubmit={(values) => {
                    newProject(values.projectName)
                }}
            >
                <Card>
                    <CardHeader>
                        <Form.Title className="text-2xl font-semibold text-white">
                            Create Project
                        </Form.Title>
                        <Form.Description className="text-sm text-muted-foreground">
                            Create a new project and start logging your events.
                        </Form.Description>
                    </CardHeader>

                    <CardContent>
                        <Form.Label name="projectName">
                            <Label className="mb-2">
                                Project Name
                            </Label>
                        </Form.Label>

                        <Form.Field name="projectName" required>
                            <Input
                                placeholder="My new Project"
                                maxLength={80}
                                autoFocus
                            />
                        </Form.Field>

                        <Form.Error className="text-sm text-destructive mt-2" name="projectName" />
                    </CardContent>

                    <CardFooter className="justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            asChild
                            disabled={creating}
                        >
                            <Link href="/">Cancel</Link>
                        </Button>

                        <Form.Submit>
                            <Button variant="primary">
                                {creating ? "Waiting..." : "Create Project"}
                            </Button>
                        </Form.Submit>
                    </CardFooter>
                </Card>
            </Form>
        </PageLayout>
    )
}
