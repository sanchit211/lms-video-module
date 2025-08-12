import LoginForm from '../components/auth/LoginForm';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4">
      <LoginForm />
    </div>
  );
}