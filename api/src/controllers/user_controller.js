import { getAll, getOne, addOne, updateOne, deleteOne, getUserByEmail } from "../models/user_model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function getUsers(req, res, next) {
  try {
    const users = await getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await getOne(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function addUser(req, res, next) {
  console.log("add called");
  try {
    console.log(req.body);
    const response = await addOne(req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const response = await updateOne(req.params.id, req.body);
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await deleteOne(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Validoi kentät
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Kaikki kentät vaaditaan" });
    }

    // Tarkista onko käyttäjä jo olemassa
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Sähköposti on jo käytössä" });
    }

    // Hash salasana
    const hashedPassword = await bcrypt.hash(password, 10);

    // Luo käyttäjä
    const newUser = await addOne({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: "Käyttäjä luotu onnistuneesti",
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validoi kentät
    if (!email || !password) {
      return res.status(400).json({ error: "Sähköposti ja salasana vaaditaan" });
    }

    // Hae käyttäjä
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Virheellinen sähköposti tai salasana" });
    }

    // Tarkista salasana
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Virheellinen sähköposti tai salasana" });
    }

    // Luo JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Kirjautuminen onnistui",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}