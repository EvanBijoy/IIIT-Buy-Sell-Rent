import React, { useState, useEffect } from 'react';
import { MainLayout } from "@/layouts/Main.layout";
import { NavbarMinimal } from "../components/NavBar/NavBar";
import { IconUser, IconEdit, IconStar, IconMail, IconPhone, IconLock } from '@tabler/icons-react';
import { useUser } from "@/providers/UserContext";
import { Button, Modal, TextInput, Stack } from '@mantine/core';
import classes from '../pagestyles/AccountPage.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function AccountPage() {
  const { user } = useUser();
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Checks if user information is available and fetches user profile
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  }, [user]);

  // Function to fetch user profile data from the server
  const fetchUserProfile = async (userId: string) => {
    
    try {
      // Gets user profile data from the server
      // Also send the token in the headers for authentication
      const response = await fetch(`https://localhost:5000/api/user/profile/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        }
      });

      const data = await response.json();

      // Sets the profile data and edited profile state
      setProfileData(data.user);
      setEditedProfile(data.user);
    } 

    catch (error) {
      console.error('Failed to fetch user profile');
    }
  };

  // Function to save the edited profile data to the server
  const handleSaveProfile = async () => {
    try {
      // Sends a PUT request to the server to update the user profile
      // Also send the token in the headers for authentication
      const response = await fetch(`https://localhost:5000/api/user/update/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        },
        body: JSON.stringify(editedProfile),
      });
      
      const data = await response.json();

      // Updates the profile data and sets the isEditing state to false
      setProfileData(data.user);
      setIsEditing(false);
    } 
    
    catch (error) {
      console.error('Failed to update profile');
    }
  };

  // Function to handle the password change request to the server
  const handlePasswordChange = async () => {
    setPasswordError('');
    
    // Checks if new passwords match the confirm password before sending the request
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    try {
      // Sends a PUT request to the server to update the user password with the new password provided
      // It also sends the current password to verify the user before changing the password
      // Also send the token in the headers for authentication
      const response = await fetch(`https://localhost:5000/api/user/changepassword/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': user?.token || ''
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      // If the response is successful, it resets the password form and closes the modal
      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Shows a success message to the user and closes the modal
        toast.success('Password changed successfully');
        setIsPasswordModalOpen(false);
      } 
      
      else {
        const data = await response.json();
        toast.error(data.message || 'Failed to change password');
        setPasswordError(data.message || 'Failed to change password');
      }
    } 
    
    catch (error) {
      setPasswordError('An error occurred while changing password');
    }
  };

  // Function to render the review stars based on the rating provided
  const renderReviewStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <IconStar 
        key={index} 
        size={16} 
        color={index < rating ? '#FFD700' : '#E0E0E0'}
        fill={index < rating ? '#FFD700' : 'none'}
      />
    ));
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <MainLayout>
      <NavbarMinimal />
      <ToastContainer autoClose={1000} hideProgressBar/>
      <div className={classes.mainContent}>
        <div className={classes.profileSection}>
          <div className={classes.profileHeader}>
            <h2>My Profile</h2>
            
            <Button variant="light" onClick={() => setIsEditing(!isEditing)}>
              <IconEdit size={16} /> {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {/* Renders the profile avatar based on the first name of the user */}
          <div className={classes.avatarSection}>
            <div className={classes.profileAvatar}>
              {profileData.firstName?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Renders the profile information based on the editing state of the profile data
          If the user is editing the profile, it shows the input fields to edit the profile
          If the user is not editing the profile, it shows the profile information */}
          {isEditing ? (
            <div>
              <input 
                type="text" 
                value={editedProfile.firstName || ''}
                onChange={(e) => setEditedProfile({...editedProfile, firstName: e.target.value})}
                placeholder="First Name"
                className={classes.editInput}
              />
              <input 
                type="text" 
                value={editedProfile.lastName || ''}
                onChange={(e) => setEditedProfile({...editedProfile, lastName: e.target.value})}
                placeholder="Last Name"
                className={classes.editInput}
              />
              <input 
                type="number" 
                value={editedProfile.age || ''}
                onChange={(e) => setEditedProfile({...editedProfile, age: Number(e.target.value)})}
                placeholder="Age"
                className={classes.editInput}
              />
              <input 
                type="number" 
                value={editedProfile.contactNumber || ''}
                onChange={(e) => setEditedProfile({...editedProfile, contactNumber: Number(e.target.value)})}
                placeholder="Contact Number"
                className={classes.editInput}
              />
              <button 
                onClick={handleSaveProfile}
                className={classes.saveButton}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div>
              <div className={classes.profileInfoItem}>
                <IconUser size={20} className={classes.icon} />
                <span>{profileData.firstName} {profileData.lastName}</span>
              </div>
              <div className={classes.profileInfoItem}>
                <IconMail size={20} className={classes.icon} />
                <span>{profileData.email}</span>
              </div>
              <div className={classes.profileInfoItem}>
                <IconPhone size={20} className={classes.icon} />
                <span>{profileData.contactNumber}</span>
              </div>
              <div className={classes.profileInfoItem}>
                <span>Age: {profileData.age}</span>
              </div>
            </div>
          )}

          <Button variant="light" fullWidth onClick={() => setIsPasswordModalOpen(true)} mt="md" mb="md">
            Change Password
          </Button>

          <Modal
            opened={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            title="Change Password"
            size="sm"
          >
            <Stack>
              <TextInput
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              />
              <TextInput
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              />
              <TextInput
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                error={passwordError}
              />
              <Button fullWidth onClick={handlePasswordChange}>
                Update Password
              </Button>
            </Stack>
          </Modal>
        </div>

        <div className={classes.reviewsSection}>
          <h2>My Reviews</h2>
          {profileData.sellerReviews?.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            profileData.sellerReviews?.map((review: any, index: number) => (
              <div 
                key={index} 
                className={classes.reviewItem}
              >
                <div className={classes.reviewHeader}>
                  <div>{renderReviewStars(review.rating)}</div>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}