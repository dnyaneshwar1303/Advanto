import bcrypt from "bcryptjs";

const password = "Admin@123";
const hashedPassword = await bcrypt.hash(password, 10);

console.log(hashedPassword);