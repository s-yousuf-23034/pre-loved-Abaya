const User = require('../models/User')
const Seller = require('../models/Seller')
const Admin = require('../models/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')

const handleLogin = async (req, res) => {

  const { email, password } = req.body

  if (email && password) {
    const emailTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailTest.test(email)
    const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@?])[A-Za-z\d@?]{8,20}$/;
    if (!validEmail) {
      res.status(400).json({ success: false, msg: 'invalid email' })
      return
    }
    if(!validPassword){
      return res.status(400).json({ success: false, msg: 'Password must be at least 8 characters long and at least one letter and one number and one special character' })

    }
    try {
      console.log('Received login request for email:', email);
      const user = await User.findOne({ email });
      const adminEmail = process.env.ADMIN_EMAIL; // Admin's predefined email
      const adminPassword = process.env.ADMIN_PASSWORD; // Admin's predefined password
      const admin = await Admin.findOne({ email: adminEmail });
      console.log('Attempting admin login...');
      console.log('Admin email:', adminEmail);
      console.log('Admin password:', adminPassword);
      if (user) {
        const verified = await bcrypt.compare(password, user.password);
        if (verified) {
          const addresses = []
          if (user.address1)
            addresses.push(user.address1)
          if (user.address2)
            addresses.push(user.address2)

          const userData = {
            name: user.firstName + ' ' + user.lastName,
            img: user.profilePicture,
            wishlist: user.wishlist,
            cart: user.cart,
            addresses: addresses
          }
          const JWT = jwt.sign({ email: email, id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: 10 })
          const refreshToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })

          res.cookie('RT', refreshToken, { httpOnly: true, secure: 'true', sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 })
          return res.status(200).json({ token: JWT, role: 'user', id: user._id, userData })
        }
      }

      if (admin) {
        console.log('Admin found in the database');
        const verified = (email === adminEmail && password === adminPassword);
        if (verified) {
          console.log('Admin login successful');
          const JWT = jwt.sign({ email: adminEmail, id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: 10 });
          const refreshToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
          res.cookie('RT', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
          return res.status(200).json({ token: JWT, role: 'admin', id: admin._id });
        } else {
          console.log('Admin login failed: Invalid credentials');
        }
      } else {
        console.log('Admin not found in the database');
      }
        
      
    } catch (e) {
      console.log(e);
      return res.status(500).json({ success: false, msg: 'server error' })
    }
  }
   res.status(400).json({ success: false, msg: "invalid credentials" });
}




const handleSellerLogin = async (req, res) => {

  const { email, password } = req.body

  if (email && password) {
    const emailTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailTest.test(email)
    const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@?])[A-Za-z\d@?]{8,20}$/;
    if (!validEmail) {
      res.status(400).json({ success: false, msg: 'invalid email' })
      return
    }
    if(!validPassword){
      return res.status(400).json({ success: false, msg: 'Password must be at least 8 characters long and at least one letter and one number and one special character' })

    }
    try {
      const seller = await Seller.findOne({ email });
      if (seller) {
        const verified = await bcrypt.compare(password, seller.password);
        if (verified) {
          const JWT = jwt.sign({ email: email, id: seller._id, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: 10 })
          const refreshToken = jwt.sign({ id: seller._id, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: '7d' })

          res.cookie('RT', refreshToken, { httpOnly: true, secure: 'true', sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 })
          return res.status(200).json({ token: JWT, role: 'seller', id: seller._id })

        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ success: false, msg: 'server error' })
    }
  }
  res.status(400).json({ success: false, msg: "invalid credentials" });
}
// const handleAdminLogin = async (req, res) => {
//   const { email, password } = req.body;

//   if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//     try {
//       const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
//       if (admin) {
//         const JWT = jwt.sign({ email: email, id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: 10 });
//         const refreshToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

//         res.cookie('RT', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
//         return res.status(200).json({ token: JWT, role: 'admin', id: admin._id });
//       }
//     } catch (e) {
//       console.log(e);
//       return res.status(500).json({ success: false, msg: 'Admin Login Failed' });
//     }
//   }res.status(400).json({ success: false, msg: "invalid admin credentials" });

// }


const handleRefresh = async (req, res) => {
  console.log('refresh');
  // console.log(req.cookies.RT);
  if (req.cookies?.RT) {
    const refreshToken = req.cookies.RT
    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        return res.status(403).send('Unauthorizedsssssss')
      }

      try {
        const { id, role } = decode
        if (role === 'user') {
          // handle user refresh
          const user = await User.findById(id)
          const addresses = []
          if (user.address1)
            addresses.push(user.address1)
          if (user.address2)
            addresses.push(user.address2)

          const userData = {
            name: user.firstName + ' ' + user.lastName,
            img: user.profilePicture,
            wishlist: user.wishlist,
            cart: user.cart,
            addresses: addresses
          }
          const JWT = jwt.sign({ email: user.email, id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: 10 })
          return res.status(200).json({ token: JWT, role: 'user', id: user._id, userData })


        } 
        if (role === 'admin') {
          try {
            const admin = await Admin.findById(id);
            const JWT = jwt.sign({ email: admin.email, id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: 10 });
            return res.status(200).json({ token: JWT, role: 'admin', id: admin._id });
          } catch (error) {
            console.log(error);
            res.status(500).json({ success: false, msg: 'server error' });
          }
        }else {
          //handle seller refresh
          const seller = await Seller.findById(id)
          const JWT = jwt.sign({ email: seller.email, id: seller._id, role: 'seller' }, process.env.JWT_SECRET)
          res.status(200).json({ token: JWT, role: 'seller', id: seller._id })
        }

      } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: 'server error' })
      }

    })
  } else {
    return res.status(403).send('Unauthorized')
  }
}

const handleLogout = (req, res) => {
  const refreshCookie = req.cookies?.RT
  console.log(refreshCookie);
  if (refreshCookie) {
    res.clearCookie('RT', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0), // Set expiration to a past date to invalidate the cookie
    path: '/' })
    res.send('logged out')
  }
}

module.exports = { handleLogin, handleSellerLogin,  handleRefresh, handleLogout }
// const User = require('../models/User')
// const Seller = require('../models/Seller')
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken')
// const cookie = require('cookie')

// const handleLogin = async (req, res) => {
//   // try {
//   //   const { email, password } = req.body

//   //   if (!email || !password) {
//   //     throw new Error('invalid')
//   //   }
//   //   const user = await User.findOne({ email });
//   //   if (!user) {
//   //     throw new Error('invalid')
//   //   }
//   //   const verified = await bcrypt.compare(password, user.password);
//   //   if (!verified) {
//   //     throw new Error('invalid')
//   //   }
//   //   const JWT = jwt.sign({email:email,role:'user'},process.env.JWT_SECRET)
//   //   res.status(200).json({token:JWT})
//   // }
//   // catch (err) {
//   //   res.status(400).json({msg:"invalid credentials"});
//   // }

//   const { email, password } = req.body

//   if (email && password) {
//     const emailTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const validEmail = emailTest.test(email)
//     const validPassword = password.length > 7;
//     if (!validEmail || !validPassword) {
//       res.status(400).json({ success: false, msg: 'invalid email or password' })
//       return
//     }
//     try {
//       const user = await User.findOne({ email });
//       if (user) {
//         const verified = await bcrypt.compare(password, user.password);
//         if (verified) {
//           const addresses = []
//           if (user.address1)
//             addresses.push(user.address1)
//           if (user.address2)
//             addresses.push(user.address2)

//           const userData = {
//             name: user.firstName + ' ' + user.lastName,
//             img: user.profilePicture,
//             wishlist: user.wishlist,
//             cart: user.cart,
//             addresses: addresses
//           }
//           const JWT = jwt.sign({ email: email, id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: 10 })
//           const refreshToken = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })

//           res.cookie('RT', refreshToken, { httpOnly: true, secure: 'true', sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 })
//           return res.status(200).json({ token: JWT, role: 'user', id: user._id, userData })
//         }
//       }
//     } catch (e) {
//       console.log(e);
//       return res.status(500).json({ success: false, msg: 'server error' })
//     }
//   }
//   res.status(400).json({ success: false, msg: "invalid credentials" });
// }




// const handleSellerLogin = async (req, res) => {

//   const { email, password } = req.body

//   if (email && password) {
//     const emailTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const validEmail = emailTest.test(email)
//     const validPassword = password.length > 7;
//     if (!validEmail || !validPassword) {
//       res.status(400).json({ success: false, msg: 'invalid email or password' })
//       return
//     }
//     try {
//       const seller = await Seller.findOne({ email });
//       if (seller) {
//         const verified = await bcrypt.compare(password, seller.password);
//         if (verified) {
//           const JWT = jwt.sign({ email: email, id: seller._id, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: 10 })
//           const refreshToken = jwt.sign({ id: seller._id, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: '7d' })

//           res.cookie('RT', refreshToken, { httpOnly: true, secure: 'true', sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 })
//           return res.status(200).json({ token: JWT, role: 'seller', id: seller._id })

//         }
//       }
//     } catch (e) {
//       console.log(e);
//       res.status(500).json({ success: false, msg: 'server error' })
//     }
//   }
//   res.status(400).json({ success: false, msg: "invalid credentials" });
// }


// const handleRefresh = async (req, res) => {
//   console.log('refresh');
//   // console.log(req.cookies.RT);
//   if (req.cookies?.RT) {
//     const refreshToken = req.cookies.RT
//     jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decode) => {
//       if (err) {
//         return res.status(403).send('Unauthorizedsssssss')
//       }

//       try {
//         const { id, role } = decode
//         if (role === 'user') {
//           // handle user refresh
//           const user = await User.findById(id)
//           const addresses = []
//           if (user.address1)
//             addresses.push(user.address1)
//           if (user.address2)
//             addresses.push(user.address2)

//           const userData = {
//             name: user.firstName + ' ' + user.lastName,
//             img: user.profilePicture,
//             wishlist: user.wishlist,
//             cart: user.cart,
//             addresses: addresses
//           }
//           const JWT = jwt.sign({ email: user.email, id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: 10 })
//           return res.status(200).json({ token: JWT, role: 'user', id: user._id, userData })


//         } else {
//           //handle seller refresh
//           const seller = await Seller.findById(id)
//           const JWT = jwt.sign({ email: seller.email, id: seller._id, role: 'seller' }, process.env.JWT_SECRET)
//           res.status(200).json({ token: JWT, role: 'seller', id: seller._id })
//         }

//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ success: false, msg: 'server error' })
//       }

//     })
//   } else {
//     return res.status(403).send('Unauthorized')
//   }
// }

// const handleLogout = (req, res) => {
//   const refreshCookie = req.cookies?.RT
//   console.log(refreshCookie);
//   if (refreshCookie) {
//     res.clearCookie('RT', { httpOnly: true, secure: true, sameSite: 'none' })
//     res.send('logged out')
//   }
// }

// module.exports = { handleLogin, handleSellerLogin, handleRefresh, handleLogout }