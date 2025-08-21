import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../../config/firebase';

export default function SignUp() {
  const navigate = useNavigate();
  useEffect(()=>{ if(auth.currentUser){ navigate('/app'); } },[navigate]);
  return (
    <>
      <PageMeta
        title="LeakShield Sign Up – Create Your Vulnerability Intelligence Account"
        description="Create your LeakShield account to access real‑time exploited vulnerability intelligence, KEV monitoring and exposure analytics."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
