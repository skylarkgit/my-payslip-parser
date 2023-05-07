const { payslip_parser } = require("./parser");
const fs = require('fs');
 
const config = {
    titles: ['Employee Code',
        'EMPLOYEE NAME',
        'Bank',
        'Bank A/c No',
        'DOJ',
        'LOP days',
        'PF A/c No',
        'STD Days',
        'PF UAN',
        'No. of Days Paid',
        'Department',
        'Designation',
        'Location',
        'Previous Month LOP',
        'Employee Class',
        'Basic',
        'PF Employee Cont.',
        'House Rent Allowance',
        'Professional Tax',
        'Leave Travel Assistance',
        'Income Tax',
        'Medical',
        'Conveyance Allowance',
        'Meal Allowance',
        'Flexi Allowance',
        'Monthly Joining Bonus',
        'Transportation Allowance',
        'GROSS EARNING',
        'GROSS DEDUCTIONS',
        'NET PAY',
        'PF - Employer Contr.',
        'NPS',
        'Labour Welfare Fund',
        'PF Arrear',
        'Flexi Allowance Arrear',
        'Relocation Domestic'],
        mustBeNumber: [
        'Bank A/c No',
        'LOP days',
        'PF A/c No',
        'STD Days',
        'PF UAN',
        'No. of Days Paid',
        'Previous Month LOP',
        'Basic',
        'PF Employee Cont.',
        'House Rent Allowance',
        'Professional Tax',
        'Leave Travel Assistance',
        'Income Tax',
        'Medical',
        'Conveyance Allowance',
        'Meal Allowance',
        'Flexi Allowance',
        'Monthly Joining Bonus',
        'Transportation Allowance',
        'GROSS EARNING',
        'GROSS DEDUCTIONS',
        'NET PAY',
        'PF - Employer Contr.',
        'NPS',
        'Labour Welfare Fund',
        'PF Arrear',
        'Flexi Allowance Arrear',
        'Relocation Domestic'
        ]
}

const paths = process.argv.slice(2)

if (paths.length == 0) {
    console.error('Please specify a space delimited list of files to process.')
    console.error(
        'npx payslip-parser /my-payslips/**.pdf'
    )
    process.exit(1)
}

(async function () {
    const responses = [];
    for (const path of paths) {
        const res = await payslip_parser(path, config);
        responses.push(res)
    }
    const csv = buildCsv(responses);
    // console.log(responses)
    fs.writeFileSync("data.csv", csv);
}())


function buildCsv(responses) {
    const headers = ['month', ...config.titles]
    const csvRows = [toCSVRow(headers)];
    console.log(csvRows.length)
    console.log(responses.length)
    csvRows.push(...responses.map(resp => toCSVRow(headers.map(h => resp[h]))))
    console.log(csvRows.length)
    return csvRows.join('\n');
}

function toCSVItem(item) {
    return item ? `"${item}"`: '';
}

function toCSVRow(items) {
    return items.map(toCSVItem).join(",");
}