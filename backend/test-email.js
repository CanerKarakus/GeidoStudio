const nodemailer = require('nodemailer');

async function testSMTP(host, port, secure) {
    console.log(`\nTesting ${host}:${port} (secure: ${secure})...`);
    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: 'info@geidostudio.com',
            pass: 'GeidoStudio789!'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS: Connected to ${host}:${port}`);
        return true;
    } catch (error) {
        console.error(`❌ FAILED: ${host}:${port}`, error.message);
        return false;
    }
}

async function runTests() {
    await testSMTP('mail.geidostudio.com', 465, true);
    await testSMTP('mail.geidostudio.com', 587, false);
    await testSMTP('smtp.turkticaret.net', 465, true);
    await testSMTP('smtp.turkticaret.net', 587, false);
}

runTests();
