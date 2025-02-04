import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import ReCAPTCHA from 'react-google-recaptcha';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../providers/UserContext';
import classes from './Login.module.css';

export function LoginBox() {
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    recaptchaToken: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecaptchaChange = (token: string | null) => {
    setFormData(prev => ({
      ...prev,
      recaptchaToken: token || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('Form data:', formData);
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://localhost:5000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          recaptchaToken: formData.recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setUser(data.user);

      // Store the user and token in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // Redirect to the home page
      navigate('/');
      
    } 
    catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } 
      else {
        setError('An unknown error occurred');
      }
    } 
    finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigate('/register');
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome back to IIIT Buy Sell Website!
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput label="Email address" placeholder="Your student mail" name="email" size="md" value={formData.email} onChange={handleInputChange} required/>

          <PasswordInput label="Password" placeholder="Your password" name="password" mt="md" size="md" value={formData.password} onChange={handleInputChange} required/>

          <div className={classes.recaptchaContainer}>
            <ReCAPTCHA
              sitekey="6LdmVLgqAAAAAI7MeztohF8bfqmsajRwMOfGSqvx"
              onChange={handleRecaptchaChange}
            />
          </div>

          {error && (
            <Text color="red" size="sm" mt="sm">
              {error}
            </Text>
          )}

          <Button fullWidth mt="xl" size="md" type="submit" loading={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
  
          <Text ta="center" mt="md">
            Don&apos;t have an account?{' '}
            <Anchor<'a'> href="#" fw={700} onClick={handleRegisterClick}>
              Register
            </Anchor>
          </Text>
        </form>
      </Paper>
    </div>
  );
}