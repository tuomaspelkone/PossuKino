import { expect } from "@jest/globals";

describe("Testing login", () => {
  test("Sample test", () => {
    expect(1 + 1).toBe(2);
  });

  const credentials = { email: "matti@example.com", password: "testpass123" };
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";

  it("should log in", async () => {
    const response = await fetch(`${apiUrl}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("message", "Kirjautuminen onnistui");
    expect(data).toHaveProperty("token");
    expect(typeof data.token).toBe("string");
    expect(data).toHaveProperty("user");
    expect(data.user).toHaveProperty("email", credentials.email);
    expect(data.user).toHaveProperty("user_id");
  });
});