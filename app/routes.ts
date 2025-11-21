import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route(":albumId", "routes/album.tsx"),
] satisfies RouteConfig;
