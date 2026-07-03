/**
 * Application Configuration
 * Version: 1.1
 */
const APP_CONFIG = {
    appName: 'ATWA Compliance Assessment',
    appVersion: '1.1.0',
    company: {
        name: 'ATWA Accounting & Taxation LLC',
        phone1: '+971 50 777 9293',
        phone2: '+971 50 777 9294',
        email: 'info@atwa.ae',
        website: 'www.atwa.ae',
        offices: [
            'Business Bay: Tamani Art Offices, 12th Floor, Office No. 1254, Dubai',
            'Garhoud: Zalfa Building, 3rd Floor, Office No. 104, Dubai'
        ]
    },
    features: {
        localStorage: true,
        pdfExport: true,
        emailCapture: true
    }
};

Object.freeze(APP_CONFIG);