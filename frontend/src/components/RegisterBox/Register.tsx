import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  NumberInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import ReCAPTCHA from 'react-google-recaptcha';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Register.module.css';
import { useUser } from '@/providers/UserContext';
import { useLocation } from 'react-router-dom';

export function RegisterBox() {
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
    password: '',
    recaptchaToken: '',
  });

  const [showRegistrationForm, setShowRegistrationForm] = useState(false); // State to control form visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const ticket = queryParams.get("ticket");

    console.log('Ticket:', ticket);

    if(ticket) {
      const fetchData = async () => {
        try {
          const res = await fetch(`https://localhost:5000/api/user/cas-auth?ticket=${ticket}`);
          const data = await res.json();

          setFormData((prev) => ({
            ...prev,
            email: data.email
          }));

          localStorage.setItem("email", data.email);
        } 
        catch (err) {
          console.error(err);
        }
        setShowRegistrationForm(true);
      };

      fetchData();
    }
  }, [location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberInputChange = (value: string | number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberInput = (name: string) => (value: string | number) => {
    handleNumberInputChange(value, name);
  };

  const handleRecaptchaChange = (token: string | null) => {
    setFormData((prev) => ({
      ...prev,
      recaptchaToken: token || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('Form data:', formData);
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://localhost:5000/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          age: formData.age,
          contactNumber: formData.contactNumber,
          password: formData.password,
          recaptchaToken: formData.recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);

      // Store the user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Store the token in localStorage
      localStorage.setItem('token', data.token);

      // Redirect to the home page
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    window.location.href = `https://login.iiit.ac.in/cas/login?service=http://localhost:5173/cas`;
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Registration
        </Title>

        {!showRegistrationForm ? (
          // Show the "Register" button initially
          <Button fullWidth mt="xl" size="md" onClick={handleRegisterClick}>
            Register with Institute CAS
          </Button>
        ) : (
          // Show the registration form after CAS login
          <form onSubmit={handleSubmit}>
            <TextInput
              label="First Name"
              placeholder="Your first name"
              name="firstName"
              size="md"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />

            <TextInput
              label="Last Name"
              placeholder="Your last name"
              name="lastName"
              size="md"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />

            <TextInput
              label="Email address"
              placeholder="Your student mail"
              name="email"
              size="md"
              value={formData.email}
              onChange={handleInputChange}
              disabled
              required
            />

            <NumberInput
              label="Age"
              placeholder="Your age"
              name="age"
              size="md"
              value={formData.age}
              onChange={handleNumberInput('age')}
              required
            />

            <NumberInput
              label="Contact Number"
              placeholder="Your contact number"
              name="contactNumber"
              size="md"
              value={formData.contactNumber}
              onChange={handleNumberInput('contactNumber')}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              name="password"
              mt="md"
              size="md"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

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
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        )}
      </Paper>
    </div>
  );
}