class UserSession {
  constructor() {
    this._user = null;
  }

  set(data) {
    this._user = data; // { uid, email, fullName, role, createdAt, emailVerified }
  }
  activate() {
    if (this._user) {
      this._user.testMode = true;
    }
  }

  /**
   * Disables test mode for the current user session.
   */
  deactivate() {
    if (this._user) {
      this._user.testMode = false;
    }
  }
  get() {
    return this._user;
  }

  clear() {
    this._user = null;
  }

  get uid()      { return this._user?.uid; }
  get email()    { return this._user?.email; }
  get fullName() { return this._user?.fullName; }
  get role()     { return this._user?.role; }
  get createdAt(){ return this._user?.createdAt; }
  get emailVerified(){ return this._user?.emailVerified || false; }
  get isTestMode()    { return this._user?.testMode || false; }

}

const userSession = new UserSession();
export default userSession;
