import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

    const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
        navigate('/chat'); // ✅ Redirect after successful login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-gray-800 text-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <div className="text-red-500">{error}</div>}
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
        />
        <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 p-2 rounded">
          Login
        </button>
      </form>
  );
};

export default Login;
