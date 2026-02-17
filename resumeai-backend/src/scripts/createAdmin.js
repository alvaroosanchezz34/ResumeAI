const email = process.env.ADMIN_EMAIL || 'admin@resumeai.com';
const password = process.env.ADMIN_PASSWORD;
if (!password) {
    console.error('❌ Set ADMIN_PASSWORD in .env first');
    process.exit(1);
}