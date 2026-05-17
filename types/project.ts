export type ProjectMember = {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
};

export type Project = {
    id: string;
    name: string;
    members: ProjectMember[];
    createdAt: string;
    updatedAt: string;
};
