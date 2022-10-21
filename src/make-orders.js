const supertest = require("supertest");
const chalk = require("chalk");
const log = console.log;

const PORT = 8090;
const authToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNkOTViYjhmLTZkZDItNDYyOS04ZTEyLWNjNmEwMDBlMGFiYiIsImVtYWlsIjoicGlwaW5vNEBwZWx1bmcuY29tIiwiZW50aXR5IjoiY2xpZW50IiwiaWF0IjoxNjY2MzU1NTUxLCJleHAiOjE2NjYzNTkxNTF9.aMMmLsL1vt6LqGX0P3XcQkfX4y9BdHgaMaWolMZXNvU";
const mockOrder = {
    merchantId: "bcbd48ee-13f0-44e9-8e26-02773da84854",
    type: "DELIVERY",
    clientId: "c9221209-206c-4b62-8b0b-66d70d95121f",
    addressId: "3d6508f1-f569-48da-8b2f-67c355116bbf",
    observations: "TESTEEE",
    deliveryFee: 12,
    subtotal: 45.8,
    finalOrderAmount: 57.8,
    items: [
        {
            index: 0,
            productId: "63eadb46-493a-4e73-a559-2df223845e14",
            unitPrice: 22.9,
            finalItemPrice: 45.8,
            totalItemPrice: 45.8,
            finalOptionsPrice: 0,
            quantity: 2,
            options: []
        }
    ]
};

let success = 0;
let fail = 0;
const errors = [];

const MAX_ORDERS = 20;
const DELAY_BETWEEN_ORDERS = 1;

function makeRequest(order) {
    log(chalk.blue(`Making order...`));
    const request = supertest(`http://localhost:${PORT}`);

    request
        .post("/orders")
        .send(JSON.stringify({ order }))
        .set("Authorization", `Bearer ${authToken}`)
        .set("Content-Type", "application/json")
        .expect(200)
        .end(function (err, res) {
            if (err) {
                const error = {
                    status: res?.status,
                    message: res?.body.message,
                    error: err
                };

                errors.push(error);

                log(chalk.red(`Error: ${JSON.stringify(error)}`));

                fail++;
            } else {
                success++;
            }
        });
}
// pnpm i chalk@4.1.2
function run() {
    log(chalk.green(`START BENCHMARKING...`));

    let i = 0;

    // alternate makeRequest with correct order and error order
    const interval = setInterval(() => {
        if (i < MAX_ORDERS) {
            if (i % 2 === 0) {
                makeRequest(mockOrder);
            } else {
                makeRequest({
                    ...mockOrder,
                    items: [
                        {
                            ...mockOrder.items[0],
                            productId: "53eadb46-493a-4e73-a559-2df223845e14"
                        }
                    ]
                });
            }

            i++;
        } else {
            clearInterval(interval);
        }
    }, DELAY_BETWEEN_ORDERS * 1000);

    const interval2 = setInterval(() => {
        if (i >= MAX_ORDERS) {
            clearInterval(interval2);

            log(chalk.green(`END BENCHMARKING...`));
            log(``);
            log(`====================`);
            log(chalk.green(`Success: ${success}`));
            log(chalk.red(`Fail: ${fail}`));
            log(`====================`);
            log(``);
            log(chalk.red(`Errors: ${JSON.stringify(errors)}`));
        }
    }, 1000);
}

run();
