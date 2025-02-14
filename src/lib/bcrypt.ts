import bcrypt from "bcrypt";

export function hashPassword(password: string): string {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function comparePassword(
  password: string,
  hashPassword: string
): boolean {
  return bcrypt.compareSync(password, hashPassword);
}
