const axios = require('axios');
const { validateEnv } = require('../config/env');

const config = validateEnv();
const MAILBLUSTER_API_URL = 'https://api.mailbluster.com/api/leads';

const createLead = async (email, firstName, lastName, fields = {}, tags = []) => {
    try {
        const apiKey = config.services.mailbluster.apiKey;
        if (!apiKey) {
            console.warn('Mailbluster API key not found');
            return;
        }

        const payload = {
            email,
            firstName,
            lastName,
            fields,
            tags,
            subscribed: true,
            overrideExisting: true
        };

        const response = await axios.post(MAILBLUSTER_API_URL, payload, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('Mailbluster Lead Updated:', response.data.message);
        return response.data;
    } catch (error) {
        console.error('Mailbluster Error:', error.response?.data || error.message);
    }
};

const sendOrderEmail = async (order, type) => {
    const { user, _id, totalAmount, items, paymentMethod, trackingNumber, carrier, trackingLink } = order;
    const frontendUrl = config.frontendUrl;

    const fields = {
        orderId: _id.toString(),
        orderTotal: totalAmount ? totalAmount.toString() : '0',
        orderItems: items ? items.map(i => `${i.name} x${i.quantity}`).join(', ') : '',
        orderLink: `${frontendUrl}/orders/${_id}`,
        paymentMethod: paymentMethod || '',
        trackingNumber: trackingNumber || '',
        carrier: carrier || '',
        trackingLink: trackingLink || ''
    };

    const tags = [`Trigger_${type}`];
    let email, firstName, lastName;

    if (order.guestCustomer) {
        email = order.guestCustomer.email;
        const names = order.guestCustomer.name ? order.guestCustomer.name.split(' ') : ['Guest'];
        firstName = names[0];
        lastName = names.length > 1 ? names.slice(1).join(' ') : '';
    } else if (order.user && order.user.email) {
        email = order.user.email;
        const names = order.user.name ? order.user.name.split(' ') : ['Customer'];
        firstName = names[0];
        lastName = names.length > 1 ? names.slice(1).join(' ') : '';
    } else {
        email = 'unknown@example.com';
        firstName = 'Customer';
        lastName = '';
    }

    if (email && email !== 'unknown@example.com') {
        await createLead(email, firstName, lastName, fields, tags);
    }
};

module.exports = {
    sendOrderEmail
};
