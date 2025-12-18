import { expect } from "@jest/globals";

function pass(msg) {
  console.log(`✅ PASSED: ${msg}`);
}

describe("Testing browsing reviews", () => {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

  test("should allow browsing reviews after creating one", async () => {
    // 1) Create a temporary user
    const newUser = {
      username: "revuser",
      email: `revuser+${Date.now()}@example.com`,
      password: "pass1234"
    };
    const registerRes = await fetch(`${apiUrl}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });
    expect(registerRes.status).toBe(201);
    const registerData = await registerRes.json();
    expect(registerData).toHaveProperty("user");
    const userId = registerData.user.user_id;

    // 2) Add a review for a fake TMDB id
    const reviewPayload = {
      tmdb_id: 603,
      user_id: userId,
      rating: 4,
      review_text: "Hyvä elokuva testi"
    };
    const addRes = await fetch(`${apiUrl}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewPayload)
    });
    expect(addRes.status).toBe(200);
    const addData = await addRes.json();
    // controller returns result.rows (array) from model; ensure we got an array with the created review
    expect(Array.isArray(addData)).toBe(true);
    expect(addData.length).toBeGreaterThan(0);

    // 3) Browse reviews (GET) and verify the created review is present
    const browseRes = await fetch(`${apiUrl}/reviews`);
    expect(browseRes.status).toBe(200);
    const reviews = await browseRes.json();
    expect(Array.isArray(reviews)).toBe(true);
    const found = reviews.find(r => r.review_text === reviewPayload.review_text && String(r.user_id) === String(userId));
    expect(found).toBeDefined();
    expect(found).toHaveProperty("tmdb_id", reviewPayload.tmdb_id);
    expect(found).toHaveProperty("rating", reviewPayload.rating);
    pass('browse reviews - should allow browsing reviews after creating one: created review is present in GET /reviews');
  });

});