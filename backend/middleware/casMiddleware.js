// @ts-nocheck
import CAS from 'cas';
import fs from 'fs';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL Certificate configuration
const ssl = {
  key: fs.readFileSync(path.join(__dirname, '../certificates/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certificates/localhost.pem')),
};

// Initialize CAS
const cas = new CAS({
  base_url: 'https://login.iiit.ac.in/cas/login',
  service: 'https://localhost:5000/api/user/cas-auth',
  version: 2.0,
});

// COME BACK AND CLEAN THIS UP
export const casAuthenticate = (req, res) => {
  return new Promise((resolve, reject) => {
    cas.authenticate(req, res, async function (err, status, username, extended)
    {
        if (err){
            console.log(err);
        }
        else{
            console.log(extended.username, extended.attributes.firstname[0], extended.attributes.lastname[0]);

            const email = extended.username;
            const firstname = extended.attributes.firstname[0];
            const lastname = extended.attributes.lastname[0];

            try{
                const userData ={
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                };
                return(userData);
            }
            catch (err)
            {
                console.log(err);
                res.status(400).json({error: 'User already exists'});
            }
        }
    });
  });
};

// Export the SSL configuration
export const sslConfig = ssl;