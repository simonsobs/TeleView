/** @type {import('next').NextConfig} */


const TELEVIEW_PUBLIC_SITE_HOST_RAW = process.env['TELEVIEW_PUBLIC_SITE_HOST']
let TELEVIEW_PUBLIC_SITE_HOST

if (TELEVIEW_PUBLIC_SITE_HOST_RAW === undefined) {
    TELEVIEW_PUBLIC_SITE_HOST = 'http://localhost:3000/'
} else {
    TELEVIEW_PUBLIC_SITE_HOST = `${TELEVIEW_PUBLIC_SITE_HOST_RAW}`
    if (!TELEVIEW_PUBLIC_SITE_HOST.endsWith("/")) {
        TELEVIEW_PUBLIC_SITE_HOST = TELEVIEW_PUBLIC_SITE_HOST + "/"
    }
}


const basePath = 'teleview';
const assetPrefix = TELEVIEW_PUBLIC_SITE_HOST + basePath + '/'


module.exports = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '',
                pathname: '/files/**',
            },
        ],
    },
    basePath: '/' + basePath,
    assetPrefix: assetPrefix,
    trailingSlash: true,
}
