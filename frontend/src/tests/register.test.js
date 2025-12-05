import { expect, test, describe } from "@jest/globals";

describe("Testing registeration", () => {
  test("Sample test", () => {
    expect(1 + 1).toBe(2);
  });

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";

  it("should sign up", async () => {
    const newUser = {
      username: "foo",
      email: `foo+${Date.now()}@foo.com`,
      password: "foo123"
    };

    const response = await fetch(`${apiUrl}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("message", "Käyttäjä luotu onnistuneesti");
    expect(data).toHaveProperty("user");
    expect(data.user).toMatchObject({ username: newUser.username, email: newUser.email });
    expect(data.user).toHaveProperty("user_id");
    expect(typeof data.user.user_id).toBe("number");
    expect(data.user.user_id).toBeGreaterThan(0);
    expect(data.user).not.toHaveProperty("password");
  });
});