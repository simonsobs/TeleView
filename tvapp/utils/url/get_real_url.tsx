const IS_SERVER = typeof window === "undefined";
const env = process.env.NODE_ENV

export function getURL(path: string) {
    const baseURL = IS_SERVER
        ? process.env.TELEVIEW_PUBLIC_SITE_URL!
        : window.location.origin;
    let urlString = baseURL.toString()
    if (urlString.endsWith("/")) {
        urlString = urlString.slice(0, -1)
    }
    if (path.startsWith("/")) {
        path = path.slice(1)
    }
    if (path === "") {
        return urlString
    }
    return baseURL.toString() + '/' + path
}


export default function getAPIBaseURL(): string {
    if (env === "development") {
        return "http://localhost:8111/api/"
    } else {
        return getURL("api/")
    }
}
