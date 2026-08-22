import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login page in sign-up mode
        navigate('/login', { state: { isSignUp: true }, replace: true });
    }, [navigate]);

    return null;
}
