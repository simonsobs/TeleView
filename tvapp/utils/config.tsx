import process from "process";

import getBaseURL from "@/utils/url/get_real_url";


// global settings for the application
const TELEVIEW_VERBOSE_RAW = process.env['TELEVIEW_VERBOSE']

export let TELEVIEW_VERBOSE: boolean
if (TELEVIEW_VERBOSE_RAW === undefined) {
    TELEVIEW_VERBOSE = false
} else {
    TELEVIEW_VERBOSE = TELEVIEW_VERBOSE_RAW !== "0"
}

// the file system for target files of the database
export const IS_SERVER = typeof window === "undefined";
export const env = process.env.NODE_ENV
const TELEVIEW_PUBLIC_SITE_HOST_RAW = process.env['TELEVIEW_PUBLIC_SITE_HOST']
export let TELEVIEW_PUBLIC_SITE_HOST: string

if (TELEVIEW_PUBLIC_SITE_HOST_RAW === undefined) {
    TELEVIEW_PUBLIC_SITE_HOST = 'http://localhost/'
} else {
    TELEVIEW_PUBLIC_SITE_HOST = TELEVIEW_PUBLIC_SITE_HOST_RAW
}

export const filesBaseURI = getBaseURL("teleview/files", env, IS_SERVER, TELEVIEW_PUBLIC_SITE_HOST)
export const apiBaseURI = getBaseURL("teleview/api", env, IS_SERVER, TELEVIEW_PUBLIC_SITE_HOST)

// The data view defaults
const TELEVIEW_DEFAULT_ITEMS_PER_PAGE_RAW = process.env['TELEVIEW_DEFAULT_ITEMS_PER_PAGE']
export let TELEVIEW_DEFAULT_ITEMS_PER_PAGE: number
if (TELEVIEW_DEFAULT_ITEMS_PER_PAGE_RAW === undefined) {
    TELEVIEW_DEFAULT_ITEMS_PER_PAGE = 100
} else {
    TELEVIEW_DEFAULT_ITEMS_PER_PAGE = parseInt(TELEVIEW_DEFAULT_ITEMS_PER_PAGE_RAW)
    if (isNaN(TELEVIEW_DEFAULT_ITEMS_PER_PAGE)) {
        TELEVIEW_DEFAULT_ITEMS_PER_PAGE = 100
    }
}
export const minIsoDate = "1970-01-01T00:00:00"
export const maxIsoDate = "2100-01-01T00:00:00"

// MongoDB database Parameters
export let mongoURI : string
if ([
    'TELEVIEW_MONGODB_ROOT_USERNAME',
    'TELEVIEW_MONGODB_ROOT_PASSWORD',
    'TELEVIEW_MONGODB_HOST',
    'TELEVIEW_MONGODB_PORT',
].every((x) => {
    return !!process.env[x]
})) {
    mongoURI = 'mongodb://' +
        process.env.TELEVIEW_MONGODB_ROOT_USERNAME + ':' + process.env.TELEVIEW_MONGODB_ROOT_PASSWORD +
        '@' + process.env.TELEVIEW_MONGODB_HOST + ':' + process.env.TELEVIEW_MONGODB_PORT +
        '/?authMechanism=DEFAULT'
} else if (process.env.NODE_ENV === 'production') {
    if (TELEVIEW_VERBOSE) {
        console.log("Using Docker Production MongoDB URI")
    }
    mongoURI = 'mongodb://user:pass@host.docker.internal:27017/?authMechanism=DEFAULT'
} else {
    mongoURI = 'mongodb://user:pass@localhost:27017/?authMechanism=DEFAULT'
}
if (TELEVIEW_VERBOSE) {
    console.log("Mongo URI:", mongoURI)
    console.log('TELEVIEW_VERBOSE_RAW -> TELEVIEW_VERBOSE:', TELEVIEW_VERBOSE_RAW, '->', TELEVIEW_VERBOSE)
}
export const primary_database = 'files'
export const primary_collection = 'smurf'
