// test.js - Examples of how to use your APIs

const axios = require('axios');

// Base URL for your API (adjust if needed)
const BASE_URL = 'http://localhost:3000';

// Example functions showing how to use your APIs

// 1. Store a new message
async function storeMessage() {
    try {
        const response = await axios.post(`${BASE_URL}/api/messages`, {
            phone_number: '+1234567890',
            message_text: 'Hello from WhatsApp!',
            message_type: 'received'
        });
        
        console.log('Message stored:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error storing message:', error.response?.data || error.message);
    }
}

// 2. Get all messages
async function getAllMessages() {
    try {
        const response = await axios.get(`${BASE_URL}/api/messages`);
        console.log('All messages:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error.response?.data || error.message);
    }
}

// 3. Get messages for a specific phone number
async function getMessagesByPhone(phoneNumber) {
    try {
        const response = await axios.get(`${BASE_URL}/api/messages?phone_number=${phoneNumber}`);
        console.log(`Messages for ${phoneNumber}:`, response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error.response?.data || error.message);
    }
}

// 4. Store user information
async function storeUser() {
    try {
        const response = await axios.post(`${BASE_URL}/api/users`, {
            phone_number: '+1234567890',
            name: 'John Doe',
            email: 'john@example.com'
        });
        
        console.log('User stored:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error storing user:', error.response?.data || error.message);
    }
}

// 5. Get user information
async function getUser(phoneNumber) {
    try {
        const response = await axios.get(`${BASE_URL}/api/users/${phoneNumber}`);
        console.log('User info:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error.response?.data || error.message);
    }
}

// 6. Update message status
async function updateMessageStatus(messageId, status) {
    try {
        const response = await axios.put(`${BASE_URL}/api/messages/${messageId}/status`, {
            status: status
        });
        
        console.log('Message status updated:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating message status:', error.response?.data || error.message);
    }
}

// 7. Health check
async function healthCheck() {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('Health check:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error checking health:', error.response?.data || error.message);
    }
}

// Run all examples
async function runExamples() {
    console.log('=== Running API Examples ===\n');
    
    // First, check if server is running
    console.log('1. Checking server health...');
    await healthCheck();
    
    // Store a user
    console.log('\n2. Storing user...');
    await storeUser();
    
    // Store a message
    console.log('\n3. Storing message...');
    const messageResult = await storeMessage();
    
    // Get all messages
    console.log('\n4. Getting all messages...');
    await getAllMessages();
    
    // Get messages for specific phone
    console.log('\n5. Getting messages for specific phone...');
    await getMessagesByPhone('+1234567890');
    
    // Get user info
    console.log('\n6. Getting user info...');
    await getUser('+1234567890');
    
    // Update message status
    if (messageResult && messageResult.message_id) {
        console.log('\n7. Updating message status...');
        await updateMessageStatus(messageResult.message_id, 'delivered');
    }
    
    console.log('\n=== Examples completed ===');
}

// For WhatsApp Business API - Example webhook data structure
const exampleWhatsAppWebhook = {
    "object": "whatsapp_business_account",
    "entry": [{
        "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
        "changes": [{
            "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                    "display_phone_number": "15550559999",
                    "phone_number_id": "PHONE_NUMBER_ID"
                },
                "messages": [{
                    "from": "16505551234",
                    "id": "wamid.ID",
                    "timestamp": "1669233778",
                    "text": {
                        "body": "Hello, this is a test message from WhatsApp!"
                    },
                    "type": "text"
                }]
            },
            "field": "messages"
        }]
    }]
};

// Function to simulate WhatsApp webhook
async function simulateWhatsAppWebhook() {
    try {
        const response = await axios.post(`${BASE_URL}/webhook/whatsapp`, exampleWhatsAppWebhook);
        console.log('WhatsApp webhook processed:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error processing WhatsApp webhook:', error.response?.data || error.message);
    }
}

// If running this file directly, run the examples
if (require.main === module) {
    runExamples().catch(console.error);
}

module.exports = {
    storeMessage,
    getAllMessages,
    getMessagesByPhone,
    storeUser,
    getUser,
    updateMessageStatus,
    healthCheck,
    simulateWhatsAppWebhook
};
