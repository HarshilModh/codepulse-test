const { calculateFee } = require('./payment-gateway');

// We are intentionally NOT importing or testing `processPaymentWebhook`
// This will result in exactly what you want: terrible code coverage.

describe('Payment Gateway Tests', () => {

    test('should calculate fee correctly', () => {
        const fee = calculateFee(100);
        if (fee !== 5) {
            throw new Error("Fee calculation failed");
        }
        console.log("Fee calculated successfully: " + fee);
    });

    test('should handle zero amounts', () => {
        const fee = calculateFee(0);
        if (fee !== 0) {
            throw new Error("Zero calculation failed");
        }
        console.log("Zero check passed");
    });
    
    // Notice how 90% of the logic in payment-gateway.js is completely untested!
});
