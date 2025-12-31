import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const submit = async e => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const user = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user.user);

    await setDoc(doc(db, 'users', user.user.uid), {
      email,
      role: 'user',
      balance: 0,
      createdAt: new Date()
    });
  };

  return (
    <form onSubmit={submit}>
      <input name="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button>Create Account</button>
    </form>
  );
}
