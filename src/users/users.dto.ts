export class User {
  id: number;
  email: string;
  password: string;
  firstSignIn: boolean;

  constructor({ id, email, password, firstSignIn }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstSignIn = firstSignIn;
  }
}
