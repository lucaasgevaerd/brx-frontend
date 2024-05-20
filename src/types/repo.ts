import { User } from "./user";

export type Repo = {
    id: number | null;
    name: string | null;
    full_name: string | null;
    html_url: string | null;
    description: string | null;
    fork: boolean | null;
    url: string | null;
    created_at: string | null;
    updated_at: string | null;
    pushed_at: string | null;
    language: string | null;
    forks_count: number | null;
    open_issues_count: number | null;
    owner: User;
}