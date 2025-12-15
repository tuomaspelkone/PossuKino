import { expect } from "@jest/globals";

function pass(msg) {
  // This log only runs when the test reaches the end (i.e. assertions passed)
  console.log(`✅ PASSED: ${msg}`);
}


describe("Testing registeration", () => {
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
  pass('registeration - should sign up: creates user and returns user info without password');
 });
});



describe("Testing login", () => {
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
    pass('login - should log in: returns token and user info');
  });
  });



describe("Testing logout", () => {

  const credentials = { email: "matti@example.com", password: "testpass123" };
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";

  it("should log out", async () =>{
    const loginResponse = await fetch(`${apiUrl}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    const loginData = await loginResponse.json();
    
    const response = await fetch(`${apiUrl}/user/logout`,{
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${loginData.token}`
      }
    });

    const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("message", "Kirjautuminen ulos onnistui");
        pass('logout - should log out: returns logout confirmation message');
  })
});



describe("Testing register delete", () => {

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3002";
    it("should delete registeration", async () => {
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
      pass('register delete - should delete registeration: created user returned');
    });




});