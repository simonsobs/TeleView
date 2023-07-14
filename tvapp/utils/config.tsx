import process from "process";

import getBaseURL from "@/utils/url/get_real_url";


// global settings for the application
const TELEVIEW_VERBOSE_RAW = process.env['TELEVIEW_VERBOSE']

export let TELEVIEW_VERBOSE: boolean
if (TELEVIEW_VERBOSE_RAW === undefined) {
    TELEVIEW_VERBOSE = true
} else {
    TELEVIEW_VERBOSE = TELEVIEW_VERBOSE_RAW !== "0"
}

// the file system for target files of the database
export const IS_SERVER = typeof window === "undefined";
export const env = process.env.NODE_ENV
const TELEVIEW_PUBLIC_SITE_URL_RAW = process.env['TELEVIEW_PUBLIC_SITE_URL']
export let TELEVIEW_PUBLIC_SITE_URL: string
if (TELEVIEW_PUBLIC_SITE_URL_RAW === undefined) {
    TELEVIEW_PUBLIC_SITE_URL = 'http://localhost/'
} else {
    TELEVIEW_PUBLIC_SITE_URL = TELEVIEW_PUBLIC_SITE_URL_RAW
}

export const filesBaseURI = getBaseURL("files", env, IS_SERVER, TELEVIEW_PUBLIC_SITE_URL)
export const apiBaseURI = getBaseURL("api", env, IS_SERVER, TELEVIEW_PUBLIC_SITE_URL)

// The data view defaults
export const documentLimitDefault = 100
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
