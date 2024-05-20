import { Repo } from "./repo";

export type User = {
    id: number;
    login: string;
    avatar_url: string;
    name: string;
    location: string;
    repos: Repo[]
} | null