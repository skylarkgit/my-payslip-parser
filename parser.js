#!/usr/bin/env node
const fs = require('fs');
const path = require('path')
const pdf = require('pdf-parse');

const payslip_parser = async function (filePath, config) {
    if (filePath.length == 0) {
        console.error('Please specify a space delimited list of files to process.');
        console.error('npx payslip-parser /my-payslips/**.pdf');
        process.exit(1);
    }
    const file = ({
        name: path.basename(filePath),
        buffer: fs.readFileSync(filePath),
        path: filePath
    })
    const response = await pdf(file.buffer, {
        pagerender:
            pageData => pageData.getTextContent()
                .then(content => content.items.map(x => x.str))
                .then(
                    items =>
                    ({
                        fileName: file.name, parsed: items.map(item => sanitize(item)).filter(item => !!item)
                    })
                )
                .then(JSON.stringify)
    })

    return buildObject(JSON.parse(response.text), config)
}

/**
 * 
 * @param {string[]} items 
 * @param {ParserConfig} config 
 */
function buildObject(input, config) {
    const response = {};
    
    const titleMap = {};
    config.titles.forEach(title => titleMap[title] = true)
    const mustBeNumberMap = {};
    config.mustBeNumber.forEach(title => mustBeNumberMap[title] = true)
    
    const items = input.parsed;
    items.forEach((item, index) => {
        if (titleMap[item]) {
            const value = items[index + 1];
            response[item] = isNumber(value) ? toNumber(value) : value
            if (mustBeNumberMap[item] && !isNumber(value)) {
                response[item] = ''
            }
        }
        if (isNumber(item) && !titleMap[items[index-1]]) {
            console.warn(`Skipped ${items[index-2]} -> ${items[index-1]} -> ${items[index]}`);
        }
    })
    response.fileName = input.fileName;
    response.month = input.fileName.split('.')[0].split('_').slice(1,3).join("/");
    return response;
}

/**
 * 
 * @param {string} str 
 * @returns {boolean}
 */
function isNumber(str) {    
    return str && /^\d+$/.test(str.replaceAll(/[-,\.]/g, ''))
}

/**
 * 
 * @param {string} str 
 * @returns {number}
 */
 function toNumber(str) {    
    return parseInt(str.replaceAll(/,/g, ''))
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
function sanitize(str) {
    return str && str.trim()
}

module.exports = {
    payslip_parser
}