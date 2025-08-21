import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../../config/firebase';

export default function SignIn() {
  const navigate = useNavigate();
  useEffect(()=>{ if(auth.currentUser){ navigate('/app'); } },[navigate]);
  return (
    <>
      <PageMeta
        title="LeakShield Sign In – Access Your Vulnerability Intelligence Dashboard"
        description="Sign in to LeakShield to view real‑time exploited vulnerability intelligence, KEV monitoring and exposure analytics."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
// This component handles the sign-in process for users, redirecting them to the app if already authenticated.
// It uses Firebase authentication and navigates to the app dashboard upon successful sign-in.
