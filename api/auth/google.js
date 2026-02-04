// import { OAuth2Client } from "google-auth-library";

// export default async function handler(req, res) {
//   const client = new OAuth2Client(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET
//   );

//   const url = client.generateAuthUrl({
//     scope: ["profile", "email"],
//     redirect_uri: process.env.GOOGLE_REDIRECT_URL,
//   });

//   res.redirect(url);
// }
export default function handler(req, res) {
          if (req.method === 'GET') {
            // Handle Google authentication logic here
            res.status(200).json({ message: 'Google Auth endpoint reached!' });
          } else {
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
          }
  }