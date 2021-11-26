import mongoose from "mongoose";
import passportLocal from "passport-local";
import passportLocalMongoose from "passport-local-mongoose";

// Typings are declared here as the @typings package for passport-local-mongoose doesn't work

interface AuthenticationResult {
  user: any;
  error: any;
}

interface PassportLocalDocument extends mongoose.Document {
  setPassword(password: string): Promise<PassportLocalDocument>;
  setPassword(password: string, cb: (err: any, res: any) => void): void;
  changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<PassportLocalDocument>;
  changePassword(
    oldPassword: string,
    newPassword: string,
    cb: (err: any, res: any) => void
  ): void;
  authenticate(password: string): Promise<AuthenticationResult>;
  authenticate(
    password: string,
    cb: (err: any, user: any, error: any) => void
  ): void;
  resetAttempts(): Promise<PassportLocalDocument>;
  resetAttempts(cb: (err: any, res: any) => void): void;
}

interface AuthenticateMethod<T> {
  (username: string, password: string): Promise<AuthenticationResult>;
  (
    username: string,
    password: string,
    cb: (err: any, user: T | boolean, error: any) => void
  ): void;
}

interface PassportLocalModel<T extends mongoose.Document>
  extends mongoose.Model<T> {
  authenticate(): AuthenticateMethod<T>;
  serializeUser(): (
    user: PassportLocalModel<T>,
    cb: (err: any, id?: any) => void
  ) => void;
  deserializeUser(): (
    username: string,
    cb: (err: any, user?: any) => void
  ) => void;

  register(user: T, password: string): Promise<T>;
  register(
    user: T,
    password: string,
    cb: (err: any, account: any) => void
  ): void;
  findByUsername(username: string, selectHashSaltFields: boolean): any;
  findByUsername(
    username: string,
    selectHashSaltFields: boolean,
    cb: (err: any, account: any) => void
  ): any;
  createStrategy(): passportLocal.Strategy;
}

export interface IAccount extends PassportLocalDocument {
  username: string;
  email: string;
  password: string;
}

const AccountSchema = new mongoose.Schema<IAccount>({
  username: String,
  email: String,
  password: String, // salted password
});

AccountSchema.plugin(passportLocalMongoose, { usernameQueryFields: ["email"] });

export const Account = mongoose.model(
  "Account",
  AccountSchema
) as PassportLocalModel<IAccount>;
