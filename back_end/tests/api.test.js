const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.JWT_SECRET ||= "test-only-secret-that-is-not-used-outside-tests";
const { app } = require("../server.js");

let server;
let baseUrl;

before(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});

test("health endpoint reports API status", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        status: "ok",
        service: "e-vaccine-reminder"
    });
});

test("child records require authentication", async () => {
    const response = await fetch(`${baseUrl}/api/children`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).message, "Authentication required");
});

test("registration validates required fields before database access", async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
    });
    assert.equal(response.status, 400);
    assert.equal(
        (await response.json()).message,
        "Name, email and password are required"
    );
});
