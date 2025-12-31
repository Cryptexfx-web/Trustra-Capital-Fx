import { auth } from '../firebase';

export const callAI = async (prompt) => {
  const token = await auth.currentUser.getIdToken();

  const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/ai', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  return (await res.json()).text;
};
