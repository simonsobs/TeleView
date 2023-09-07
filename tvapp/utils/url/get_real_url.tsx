

function joinURL(base: string, path: string) {
    if (base.endsWith("/")) {
        base = base.slice(0, -1)
    }
    if (path.startsWith("/")) {
        path = path.slice(1)
    }
    if (path === "") {
        return base
    }
    return base + '/' + path

}
function getURL(path: string, isServer:boolean, publicSiteURL:string) {
    const baseURL = isServer
        ? publicSiteURL!
        : window.location.origin;
    return joinURL(baseURL.toString(), path)
}


export default function getBaseURL(path: string, env: string | undefined, isServer:boolean, publicSiteURL:string)
    : string {
    if (env === "development") {
        return joinURL("http://localhost:8111/", path) + '/'
    } else {
        return getURL(path, isServer, publicSiteURL) + '/'
    }
}

