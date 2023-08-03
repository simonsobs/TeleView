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
console.log('assetPrefix', assetPrefix)


const TELEVIEW_DEFAULT_ITEMS_PER_PAGE_RAW = process.env['TELEVIEW_DEFAULT_ITEMS_PER_PAGE']
let TELEVIEW_DEFAULT_ITEMS_PER_PAGE
if (TELEVIEW_DEFAULT_ITEMS_PER_PAGE_RAW === undefined) {
    TELEVIEW_DEFAULT_ITEMS_PER_PAGE = 100
} else {
    TELEVIEW_DEFAULT_ITEMS_PER_PAGE = parseInt(TELEVIEW_DEFAULT_ITEMS_PER_PAGE_RAW)
    if (isNaN(TELEVIEW_DEFAULT_ITEMS_PER_PAGE)) {
        TELEVIEW_DEFAULT_ITEMS_PER_PAGE = 100
    }
}
const defaultPage = '/~' + `document_range\$0-${TELEVIEW_DEFAULT_ITEMS_PER_PAGE}`

console.log("defaultPage", defaultPage)

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
    async redirects() {
        return [
            {
                source: '/',
                destination: defaultPage,
                permanent: true,
            },
        ]
    },
}
