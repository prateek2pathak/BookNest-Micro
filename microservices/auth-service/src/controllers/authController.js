import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "email already exists" });
      
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashed, role });
      await user.save();
      
      res.status(201).json({ message: "registered successfully" });
    } catch (err) {
      res.status(500).json({ message: "registration failed" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "invalid credentials" });
      
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: "invalid credentials" });
      
      const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      res.json({
        token,
        role: user.role,
        username: user.username,
        email: user.email,
        message: "login successful"
      });
    } catch (err) {
      res.status(500).json({ message: "login failed" });
    }
  }

  async validate(req, res) {
    try {
      // token is already validated by middleware
      res.json({ 
        valid: true, 
        user: req.user 
      });
    } catch (err) {
      res.status(500).json({ message: "validation failed" });
    }
  }
}

export default new AuthController();
