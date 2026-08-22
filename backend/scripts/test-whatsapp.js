const { sendTextMessage } = require("../utils/whatsappService");
require('dotenv').config();

const number = process.argv[2];
if (!number) {
    console.log("Usage: node test-whatsapp.js <number>");
    console.log("Example: node test-whatsapp.js 923001234567");
    console.log("\nNote: Use international format without + or spaces");
    process.exit(1);
}

console.log(`\n📱 Sending test message to ${number}...\n`);

sendTextMessage(number, "🎉 Test message from Omnora WhatsApp API\n\nYour WhatsApp integration is working correctly!")
    .then((response) => {
        if (response) {
            console.log("✅ Message sent successfully!");
            console.log("\nResponse:", JSON.stringify(response, null, 2));
            console.log("\n✨ WhatsApp integration is working! Check the recipient's phone.");
        } else {
            console.log("❌ Message failed (check logs for details).");
            console.log("\nTroubleshooting:");
            console.log("1. Verify your WHATSAPP_CLOUD_API_TOKEN in .env");
            console.log("2. Verify your WHATSAPP_PHONE_ID in .env");
            console.log("3. Ensure the phone number is in international format (e.g., 923001234567)");
            console.log("4. Check that the recipient has WhatsApp installed");
        }
    })
    .catch(err => {
        console.error("❌ Script Error:", err);
        console.log("\nTroubleshooting:");
        console.log("1. Make sure .env file exists in backend directory");
        console.log("2. Verify all environment variables are set correctly");
    });
