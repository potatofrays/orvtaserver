var police_user = require('../models/user'); // Import User Model
var models = require('../models/police_reports'); // Import Report Model
var account_reset = require('../models/accountReset');
var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'harrypotter'; // Create custom secret for use in JWT
var nodemailer = require('nodemailer'); // Import Nodemailer Package
var sgTransport = require('nodemailer-sendgrid-transport'); // Import Nodemailer Sengrid Transport Package

module.exports = function(router) {
    // Nodemailer options (use with g-mail or SMTP)
    var client = nodemailer.createTransport({
        service: 'Zoho',
        auth: {
            user: 'orvtiateam@zoho.com', // Your email address
            pass: 'orvt1ate@m' // Your password
        },
        tls: { rejectUnauthorized: false }
    });
    // var client = nodemailer.createTransport(sgTransport(options)); // Use if using sendgrid configuration
    // End Sendgrid Configuration Settings
    // Route to register new users
    router.post('/police_users', function(req, res) {
        var user = new police_user(); // Create new User object
        user.police_username = req.body.police_username; // Save username from request to User object
        user.police_password = req.body.police_password; // Save password from request to User object
        user.police_email = req.body.police_email; // Save email from request to User object
        user.police_name = req.body.police_name; // Save name from request to User object
        user.police_contact = req.body.police_contact; // Save contact number from request to User object
        user.police_station = req.body.police_station; // Save station from request to User object
        user.police_permission = req.body.police_permission;
        user.police_gender = req.body.police_gender; // Save gender from request to User object
        user.police_rank = req.body.police_rank; // Save rank from request to User object
        user.police_address = req.body.police_address;

        user.temporarytoken = jwt.sign({ police_username: user.police_username, police_email: user.police_email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail

        // Check if request is valid and not empty or null
        if (req.body.police_username === null || req.body.police_username === '' || req.body.police_password === null || req.body.police_password === '' || req.body.police_email === null || req.body.police_email === ''
        || req.body.police_name === null || req.body.police_name === ''|| req.body.police_contact === null || req.body.police_contact === '' || req.body.police_station === null
        || req.body.police_station === '' || req.body.police_gender === null || req.body.police_gender === '' || req.body.police_rank === null || req.body.police_rank === '' || req.body.police_permission === null || req.body.police_permission === ''
        || req.body.police_address === null || req.body.police_address === '') {
            res.json({ success: false, message: 'Ensure all data were provided' });
        } else {
            // Save new user to database
            user.save(function(err) {
                if (err) {
                    // Check if any validation errors exists (from user model)
                    if (err.errors !== null) {
                        if (err.errors.police_name) {
                            res.json({ success: false, message: err.errors.police_name.message }); // Display error in validation (name)
                        } else if (err.errors.police_email) {
                            res.json({ success: false, message: err.errors.police_email.message }); // Display error in validation (email)
                        } else if (err.errors.police_username) {
                            res.json({ success: false, message: err.errors.police_username.message }); // Display error in validation (username)
                        } else if (err.errors.police_password) {
                            res.json({ success: false, message: err.errors.police_password.message }); // Display error in validation (password)
                        } else if (err.errors.police_contact) {
                            res.json({ success: false, message: err.errors.police_contact.message }); // Display error in validation (password)
                        } else {
                            res.json({ success: false, message: err }); // Display any other errors with validation
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That username is already taken' }); // Display error if username already taken
                            } else if (err.errmsg[61] == "e") {
                                res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
                            }
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
                    res.json({ success: true, message: 'Police account registered.' }); // Send success message back to controller/request

                }
            });
        }
    });
    // Route to check if username chosen on registration page is taken
    router.post('/checkusername', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That username is already taken' }); // If user is returned, then username is taken
                } else {
                    res.json({ success: true, message: 'Valid username' }); // If user is not returned, then username is not taken
                }
            }
        });
    });
    // Route to check if e-mail chosen on registration page is taken
    router.post('/checkemail', function(req, res) {
        police_user.findOne({ police_email: req.body.police_email }).select('police_email').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That e-mail is already taken' }); // If user is returned, then e-mail is taken
                } else {
                    res.json({ success: true, message: 'Valid e-mail' }); // If user is not returned, then e-mail is not taken
                }
            }
        });
    });
    // Route for user logins
    router.post('/authenticate', function(req, res) {
        var loginUser = (req.body.police_username); // Ensure username is checked in lowercase against database
        police_user.findOne({ police_username: loginUser }).select('police_name police_email police_username police_password police_station police_permission').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if user is found in the database (based on username)
                if (!user) {
                    res.json({ success: false, message: 'Username not found' }); // Username not found in database
                } else if (user) {
                    // Check if user does exist, then compare password provided by user
                    if (!req.body.police_password){
                      res.json({ success: false, message: 'No password provided' }); // Password and Station was not provided
                    } else {
                        var validPassword = user.comparePassword(req.body.police_password); // Check if password matches password provided by user
                        if (!validPassword) {
                            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
                        } else {
                          if (user.police_permission === 'user'){
                              res.json({ success: false, message: 'You must be an admin to login.' }); // Password does not match password in database
                          } else if (user.police_permission === 'main' && user.police_station !== 'Lingayen'){
                                res.json({ success: false, message: 'Your station must be Lingayen.' }); // Password does not match password in database
                          } else {
                            var token = jwt.sign({ police_name: user.police_name, police_username: user.police_username, police_email: user.police_email, police_station: user.police_station, police_permission: user.police_permission  }, secret, { expiresIn: '24h' }); // Logged in: Give user token
                            res.json({ success: true, message: 'User authenticated', token: token }); // Return token in JSON object to controller
                          }
                        }
                    }
                }
            }
        });
    });
    // Route to send user's username to e-mail
    router.get('/resetusername/:police_email', function(req, res) {
        police_user.findOne({ police_email: req.params.police_email }).select('police_email police_name police_username').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: err }); // Error if cannot connect
            } else {
                if (!user) {
                    res.json({ success: false, message: 'E-mail was not found' }); // Return error if e-mail cannot be found in database
                } else {
                    // If e-mail found in database, create e-mail object
                    var email = {
                        from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                        to: user.police_email,
                        subject: 'Android Username Request',
                        text: 'Hello ' + user.police_name + ', You recently requested your username. Please save it in your files: ' + user.police_username,
                        html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>You recently requested your username. Please save it in your files: ' + user.police_username
                    };

                    // Function to send e-mail to user
                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err); // If error in sending e-mail, log to console/terminal
                        } else {
                            console.log(info); // Log confirmation to console
                        }
                    });
                    res.json({ success: true, message: 'Username has been sent to e-mail! ' }); // Return success message once e-mail has been sent
                }
            }
        });
    });
    // Route to send reset link to the user
    router.put('/resetpassword', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username police_email resettoken police_name').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Username was not found' }); // Return error if username is not found in database
                } else {
                    user.resettoken = jwt.sign({ police_username: user.police_username, police_email: user.police_email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail
                    // Save token to user in database
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err }); // Return error if cannot connect
                        } else {
                            // Create e-mail object to send to user
                            var email = {
                                from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                to: user.police_email,
                                subject: 'Reset Password Request',
                                text: 'Hello ' + user.police_name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://orvtawebserver.herokuapp.com/reset/' + user.resettoken,
                                html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://orvtawebserver.herokuapp.com/reset/' + user.resettoken + '">http://orvtawebserver.herokuapp.com/reset/</a>'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(email, function(err, info) {
                                if (err) {
                                    console.log(err); // If error with sending e-mail, log to console/terminal
                                } else {
                                    console.log(info); // Log success message to console
                                    console.log('sent to: ' + user.email); // Log e-mail
                                }
                            });
                            res.json({ success: true, message: 'Please check your e-mail for password reset link' }); // Return success message
                        }
                    });
                }
            }
        });
    });
    // Route to verify user's e-mail activation link
    router.get('/resetpassword/:token', function(req, res) {
        police_user.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                var token = req.params.token; // Save user's token from parameters to variable
                // Function to verify token
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Password link has expired' }); // Token has expired or is invalid
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'Password link has expired' }); // Token is valid but not no user has that token anymore
                        } else {
                            res.json({ success: true, user: user }); // Return user object to controller
                        }
                    }
                });
            }
        });
    });
    // Save user's new password to database
    router.put('/savepassword', function(req, res) {
        police_user.findOne({ police_username: req.body.police_username }).select('police_username police_email police_name police_password resettoken').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (req.body.police_password === null || req.body.police_password === '') {
                    res.json({ success: false, message: 'Password not provided' });
                } else {
                    user.police_password = req.body.police_password; // Save user's new password to the user object
                    user.resettoken = false; // Clear user's resettoken
                    // Save user's new data
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            // Create e-mail object to send to user
                            var email = {
                                from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                to: user.police_email,
                                subject: 'Password Recently Reset',
                                text: 'Hello ' + user.police_name + ', This e-mail is to notify you that your password was recently reset at localhost.com',
                                html: 'Hello<strong> ' + user.police_name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at localhost.com'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(email, function(err, info) {
                                if (err) console.log(err); // If error with sending e-mail, log to console/terminal
                            });
                            res.json({ success: true, message: 'Password has been reset!' }); // Return success message
                        }
                    });
                }
            }
        });
    });
    // Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

        // Check if token is valid and not expired
        if (token) {
            // Function to verify token
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
                    next(); // Required to leave middleware
                }
            });
        } else {
            res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
        }
    });
    // Route to get the currently logged in user
    router.post('/me', function(req, res) {
        res.send(req.decoded); // Return the token acquired from middleware
    });
    // Route to provide the user with a new token to renew session
    router.get('/renewToken/:police_username', function(req, res) {
        police_user.findOne({ police_username: req.params.police_username }).select('police_username police_email').exec(function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return error
                } else {
                    var newToken = jwt.sign({ police_username: user.police_username, email: user.police_email,  }, secret, { expiresIn: '24h' }); // Give user a new token
                    res.json({ success: true, token: newToken }); // Return newToken in JSON object to controller
                }
            }
        });
    });
    // Route to get the current user's permission level
    router.get('/permission', function(req, res) {
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, user) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return an error
                } else {
                    res.json({ success: true, police_permission: user.police_permission }); // Return the user's permission
                }
            }
        });
    });
    // Route to get all users for management page
    router.get('/management', function(req, res) {
        police_user.find({}, function(err, police_users) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in user was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === "Lingayen") {
                                // Check if users were retrieved from database
                              if (!police_users) {
                                  res.json({ success: false, message: 'Users not found' }); // Return error
                              } else {
                                police_user.find({ police_permission: { $ne: 'main'}}, function(err, police_users){

                                    res.json({ success: true, police_users: police_users, police_permission: mainUser.police_permission, police_station: mainUser.police_station }); // Return
                                  });
                                }
                            } else if (mainUser.police_permission === 'station'){
                              // Check if users were retrieved from database
                              if (!police_users) {
                                  res.json({ success: false, message: 'Users not found' }); // Return error
                              } else {
                                police_user.find({ police_station: req.decoded.police_station, police_permission: 'user'}, function(err, police_users) {
                                  res.json({ success: true, police_users: police_users, police_permission: mainUser.police_permission, police_station: mainUser.police_station }); // Return users, along with current user's permission
                                });
                              }
                            }  else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });

    });
    // Route to delete a user
    router.delete('/management/:police_username', function(req, res) {
        var deletedUser = req.params.police_username; // Assign the username from request parameters to a variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if current user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if curent user has admin access
                    if (mainUser.police_permission !== 'main' && mainUser.police_permission !== 'station') {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    } else {
                        // Fine the user that needs to be deleted
                        police_user.findOneAndRemove({ police_username: deletedUser }, function(err, user) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'orvtiadeveloper@zoho.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true }); // Return success status
                            }
                        });
                    }
                }
            }
        });
    });
    router.get('/edit2/:id', function(req, res){
       police_user.findById(req.params.id, function(err, police){
           if(err){
               res.json(500, err);
           }else{
               res.json({success: true, police: police});
           }
       })
    });
    router.put('/edit2', function(req,res){
      police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
        if (mainUser.police_permission === 'station' || mainUser.police_permission === 'main'){
          if (req.body.police_name || req.body.police_email || req.body.police_username || req.body.police_contact
          || req.body.police_address || req.body.police_gender || req.body.police_rank ||  req.body.police_station || req.body.police_permission){
          police_user.findById(req.body._id, function(err, police){
              if (err){
                  res.json(500, err);
              } else {
                if (req.body.police_station === 'Agno'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Aguilar'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Alaminos'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Alcala'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Anda'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                                    || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Asingan'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Balungao'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Bani'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Basista'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Bautista'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Bayambang'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Binalonan'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Binmaley'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Bolinao'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Bugallon'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Burgos'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Calasiao'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Dagupan'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Dasol'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Infanta'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Labrador'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Laoac'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Lingayen'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Mabini'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Malasiqui'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Manaoag'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Mangaldan'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Mangatarem'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Mapandan'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Natividad'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Pozorrubio'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Rosales'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'San Carlos'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'San Fabian'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'San Jacinto'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'San Manuel'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'San Nicolas'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'San Quintin'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Santa Barbara'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Santa Maria'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Santo Tomas'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Sison'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Sual'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Tayug'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Umingan'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Urbiztondo'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Urdaneta'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Villasis') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Agno')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                } else if (req.body.police_station === 'Villasis'){
                  if ((mainUser.police_permission === 'station' && police.police_station === 'Aguilar') || (mainUser.police_permission === 'station' && police.police_station === 'Alcala') || (mainUser.police_permission === 'station' && police.police_station === 'Anda')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Asingan') || (mainUser.police_permission === 'station' && police.police_station === 'Balungao') || (mainUser.police_permission === 'station' && police.police_station === 'Bani')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Basista') || (mainUser.police_permission === 'station' && police.police_station === 'Bautista') || (mainUser.police_permission === 'station' && police.police_station === 'Bayambang')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Binalonan') || (mainUser.police_permission === 'station' && police.police_station === 'Binmaley') || (mainUser.police_permission === 'station' && police.police_station === 'Bolinao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Bugallon') || (mainUser.police_permission === 'station' && police.police_station === 'Burgos') || (mainUser.police_permission === 'station' && police.police_station === 'Calasiao')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Dasol') || (mainUser.police_permission === 'station' && police.police_station === 'Infanta') || (mainUser.police_permission === 'station' && police.police_station === 'Labrador')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Laoac') || (mainUser.police_permission === 'station' && police.police_station === 'Lingayen') || (mainUser.police_permission === 'station' && police.police_station === 'Mabini')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Malasiqui') || (mainUser.police_permission === 'station' && police.police_station === 'Manaoag') || (mainUser.police_permission === 'station' && police.police_station === 'Mangaldan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Mangatarem') || (mainUser.police_permission === 'station' && police.police_station === 'Mapandan') || (mainUser.police_permission === 'station' && police.police_station === 'Natividad')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Pozorrubio') || (mainUser.police_permission === 'station' && police.police_station === 'Rosales') || (mainUser.police_permission === 'station' && police.police_station === 'San Fabian')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Jacinto') || (mainUser.police_permission === 'station' && police.police_station === 'San Manuel') || (mainUser.police_permission === 'station' && police.police_station === 'San Nicolas')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Quintin') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Barbara') || (mainUser.police_permission === 'station' && police.police_station === 'Santa Maria')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Santo Tomas') || (mainUser.police_permission === 'station' && police.police_station === 'Sison') || (mainUser.police_permission === 'station' && police.police_station === 'Sual')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Tayug')  || (mainUser.police_permission === 'station' && police.police_station === 'Umingan') || (mainUser.police_permission === 'station' && police.police_station === 'Urbiztondo')
                  || (mainUser.police_permission === 'station' && police.police_station === 'Agno') || (mainUser.police_permission === 'station' && police.police_station === 'Alaminos') || (mainUser.police_permission === 'station' && police.police_station === 'Dagupan')
                  || (mainUser.police_permission === 'station' && police.police_station === 'San Carlos') || (mainUser.police_permission === 'station' && police.police_station === 'Urdaneta')){
                    res.json({success: false, message: 'You must be a main admin to update police station'});
                  } else {
                    if (req.body.police_permission === 'user'){
                       if (police.police_permission === 'station' || police.police_permission === 'main'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade android user' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                       } else {
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       }
                     } else if (req.body.police_permission === 'station'){
                       if (police.police_permission === 'user'){
                         if (mainUser.police_permission !== 'main'){
                            res.json({ success: false, message: 'You must be an Admin to upgrade Android user.' }); //
                         } else {
                           police.police_station = req.body.police_station;
                           police.police_name = req.body.police_name;
                           police.police_email = req.body. police_email;
                           police.police_username = req.body.police_username;
                           police.police_contact = req.body.police_contact;
                           police.police_address = req.body.police_address;
                           police.police_gender = req.body.police_gender;
                           police.police_rank = req.body.police_rank;
                           police.police_permission = req.body.police_permission;
                           police.save(function(err){
                             if (err) {
                               res.json(500, err);
                             } else {
                               res.json({success: true, message: 'Updated', police: police});
                             }
                           });
                         }
                      } else {
                        police.police_station = req.body.police_station;
                        police.police_name = req.body.police_name;
                        police.police_email = req.body. police_email;
                        police.police_username = req.body.police_username;
                        police.police_contact = req.body.police_contact;
                        police.police_address = req.body.police_address;
                        police.police_gender = req.body.police_gender;
                        police.police_rank = req.body.police_rank;
                        police.police_permission = req.body.police_permission;
                        police.save(function(err){
                          if (err) {
                            res.json(500, err);
                          } else {
                            res.json({success: true, message: 'Updated', police: police});
                          }
                        });
                      }
                     } else if (req.body.police_permission === 'main'){
                       if (mainUser.police_permission === 'main'){
                         police.police_station = req.body.police_station;
                         police.police_name = req.body.police_name;
                         police.police_email = req.body. police_email;
                         police.police_username = req.body.police_username;
                         police.police_contact = req.body.police_contact;
                         police.police_address = req.body.police_address;
                         police.police_gender = req.body.police_gender;
                         police.police_rank = req.body.police_rank;
                         police.police_permission = req.body.police_permission;
                         police.save(function(err){
                           if (err) {
                             res.json(500, err);
                           } else {
                             res.json({success: true, message: 'Updated', police: police});
                           }
                         });
                       } else {
                          res.json({ success: false, message: 'You must be an Admin to upgrade someone to the Admin level.' }); // Return error
                       }
                     } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                     }
                  }
                }
              }
            });
          } else {
            res.json({success: false, message: 'No Update'});
          }
        } else {
          res.json({success: false, message: 'Insufficient Permission Lol'});
        }
     });
    });
    router.get('/findReport', function(req,res){
     models.Police_Report.find({})
     .populate({path:"people_involved_id", model:"People_Involved"})
     .populate({path:"vehicle_id", model:"Vehicle"})
     .exec(function(err, police_reports){

         if (err) {
             res.json(500,err);
         }else{
             police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                 if (err) {
                     // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                 var email = {
                     from: 'ORVTIA Team Staff, orvtiaquestion@gmail.com',
                     to: 'orvtiateam@gmail.com',
                     subject: 'Error Logged',
                     text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                     html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                 };
                 // Function to send e-mail to myself
                 client.sendMail(email, function(err, info) {
                     if (err) {
                         console.log(err); // If error with sending e-mail, log to console/terminal
                     } else {
                         console.log(info); // Log success message to console if sent
                         console.log(user.email); // Display e-mail that it was sent to
                     }
                 });
                 res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                 } else {
                     // Check if logged in report was found in database
                     if (!mainUser) {
                         res.json({ success: false, message: 'No user found' }); // Return error
                     } else {
                         // Check if user has editing/deleting privileges
                         if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                             // Check if users were retrieved from database
                             if (!police_reports) {
                                 res.json({ success: false, message: 'No report found' }); // Return error
                             } else {
                               models.Police_Report.find({ $and: [{report_credibility: { $ne: 'Fraud'}}, {report_credibility: { $ne: 'Pending'}}]})
                               .populate({path:"people_involved_id", model:"People_Involved"})
                               .populate({path:"vehicle_id", model:"Vehicle"})
                               .exec(function(err,police_reports){
                               if (err) {
                                        res.json(500,err);
                                } else {
                                   res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                               }
                           });

                             }
                         } else if (mainUser.police_permission === 'station' && mainUser.police_station === req.decoded.police_station){
                             if (!police_reports) {
                                 res.json({ success: false, message: 'No report found' }); // Return error
                             } else {
                                 models.Police_Report.find({address_municipality: req.decoded.police_station, $and: [{report_credibility: { $ne: 'Fraud'}}, {report_credibility: { $ne: 'Pending'}}]})
                                 .populate({path:"people_involved_id", model:"People_Involved"})
                                 .populate({path:"vehicle_id", model:"Vehicle"})
                                 .exec(function(err,police_reports){
                                 if (err) {
                                          res.json(500,err);
                                  } else {
                                     res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                 }
                             });
                             }

                         } else {
                             res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                         }
                     }
                 }
             });
         }
     });
    });
    router.get('/editReport2/:id', function(req, res){
      models.Police_Report.findById(req.params.id, function(err,report){
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, report: report});
          }
      });
    });
    router.put('/editReport2', function(req,res){
      if(req.body.accident_type || req.body.accident_cause || req.body.address_thoroughfare
      || req.body.address_municipality || req.body.address_province){
      models.Police_Report.findById(req.body._id, function(err, report){
        if (err) {
          res.json(500, err);
        } else {
          report.committed_at = req.body.committed_at;
          report.accident_type = req.body.accident_type;
          report.accident_cause = req.body.accident_cause;
          report.address_thoroughfare = req.body.address_thoroughfare;
          report.address_municipality = req.body.address_municipality;
          report.address_province = req.body.address_province;
          report.save(function(err){
            if (err) {
                 res.json(500, err);
             } else {
                res.json({success: true, message: 'Updated', report: report});
             }
           });
          }
       });
      }
    });
    router.get('/editReport/:id', function(req, res){
      models.Police_Report.findById(req.params.id, function(err,report){
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, report: report});
          }
      });
    });
    router.put('/editReport', function(req,res){
      if(req.body.accident_type || req.body.accident_cause || req.body.address_thoroughfare
      || req.body.address_municipality || req.body.address_province || req.body.report_credibility || req.body.police_username){
      models.Police_Report.findById(req.body._id, function(err, report){
        if (err) {
          res.json(500, err);
        } else {
          report.committed_at = req.body.committed_at;
          report.accident_type = req.body.accident_type;
          report.accident_cause = req.body.accident_cause;
          report.address_thoroughfare = req.body.address_thoroughfare;
          report.address_municipality = req.body.address_municipality;
          report.address_province = req.body.address_province;
          report.report_credibility = req.body.report_credibility;
          report.police_username = req.body.police_username;
          report.save(function(err){
            if (err) {
                 res.json(500, err);
             } else {
                res.json({success: true, message: 'Updated', report: report});
             }
           });
          }
       });
      }
    });
    router.put('/addPeople', function(req,res){
        if(req.body.people_involved_age || req.body.people_involved_name || req.body.people_involved_gender || req.body.people_involved_citizenship
        || req.body.people_involved_violation || req.body.people_involved_status || req.body.people_involved_type){
        models.Police_Report.findById(req.body._id, function(err, people){
            var addPep = new models.People_Involved();
            addPep.people_involved_age = req.body.people_involved_age;
            addPep.people_involved_name = req.body.people_involved_name;
            addPep.people_involved_gender = req.body.people_involved_gender;
            addPep.people_involved_citizenship = req.body.people_involved_citizenship;
            addPep.people_involved_violation = req.body.people_involved_violation;
            addPep.people_involved_status = req.body.people_involved_status;
            addPep.people_involved_type = req.body.people_involved_type;
            addPep.save();
            if(err){
                 res.json(500, err);
             } else if (people){
                people.people_involved_id.push(addPep);
                people.save();
                res.json({success:true, message: 'Sa wakas'});
             }
          });
        }
    });
    router.put('/addVehicle', function(req,res){
        if(req.body.vehicle_platenumber || req.body.vehicle_brand || req.body.vehicle_type || req.body.vehicle_model || req.body.vehicle_driver){
        models.Police_Report.findById(req.body._id, function(err, vehicle){
            var addVehicle = new models.Vehicle();
            addVehicle.vehicle_platenumber = req.body.vehicle_platenumber;
            addVehicle.vehicle_brand = req.body.vehicle_brand;
            addVehicle.vehicle_type = req.body.vehicle_type;
            addVehicle.vehicle_model = req.body.vehicle_model;
            addVehicle.vehicle_driver = req.body.vehicle_driver;
            addVehicle.save();
            if(err){
                 res.json(500, err);
             } else if (vehicle){
                vehicle.vehicle_id.push(addVehicle);
                vehicle.save();
                res.json({success:true, message: 'Sa wakas'});
             }
          });
        }
    });
    router.get('/editPeopleInvolved/:id', function(req, res){
     models.People_Involved.findById(req.params.id, function(err, people) {
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, people: people});
          }
      });
    });
    router.put('/editPeopleInvolved', function(req,res){
      if(req.body.people_involved_age || req.body.people_involved_name || req.body.people_involved_gender || req.body.people_involved_citizenship
      || req.body.people_involved_violation || req.body.people_involved_status || req.body.people_involved_type){
      models.People_Involved.findById(req.body._id, function(err, people){
        if (err) {
          res.json(500, err);
        } else {
          people.people_involved_name = req.body.people_involved_name;
          people.people_involved_age = req.body.people_involved_age;
          people.people_involved_gender = req.body.people_involved_gender;
          people.people_involved_citizenship = req.body.people_involved_citizenship;
          people.people_involved_violation = req.body.people_involved_violation;
          people.people_involved_status = req.body.people_involved_status;
          people.people_involved_type = req.body.people_involved_type;
          people.save(function(err){
            if (err) {
                 res.json(500, err);
             } else {
                res.json({success: true, message: 'Updated', people: people});
             }
           });
          }
       });
      }
    });
    router.get('/editVehicle/:id', function(req, res){
     models.Vehicle.findById(req.params.id, function(err, vehicle) {
          if(err){
              res.json(500,err);
          }else{
              res.json({success: true, vehicle: vehicle});
          }
      });
    });
    router.put('/editVehicle', function(req,res){
        if(req.body.vehicle_platenumber || req.body.vehicle_brand || req.body.vehicle_type || req.body.vehicle_model || req.body.vehicle_driver){
      models.Vehicle.findById(req.body._id, function(err, vehicle){
        if (err) {
          res.json(500, err);
        } else {
          if (req.body.vehicle_type === 'Bicycle'){
            vehicle.vehicle_platenumber = req.body.vehicle_platenumber;
            vehicle.vehicle_brand = req.body.vehicle_brand;
            vehicle.vehicle_model = req.body.vehicle_model;
            vehicle.vehicle_type = '';
            vehicle.vehicle_driver = req.body.vehicle_driver;
            vehicle.save(function(err){
              if (err) {
                   res.json(500, err);
               } else {
                  res.json({success: true, message: 'Updated', vehicle: vehicle});
               }
             });
          } else {
            vehicle.vehicle_platenumber = req.body.vehicle_platenumber;

          }

          }
       });
      }
    });
    // Route to get all report for management page
    router.get('/citizenReportManagement', function(req, res) {
        models.Police_Report.find({}, function(err, police_reports) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                                // Check if users were retrieved from database
                                if (!police_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  models.Police_Report.find({ $or: [{report_credibility: 'Fraud'}, {report_credibility: 'Pending'}] }, function(err, police_reports) {
                                    res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });

                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === req.decoded.police_station){
                                if (!police_reports) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  models.Police_Report.find({ address_municipality: req.decoded.police_station, $or: [{report_credibility: 'Fraud'}, {report_credibility: 'Pending'}] }, function(err, police_reports) {
                                    res.json({ success: true, police_reports: police_reports, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    // Route to get the report that needs to be edited
    // Route to get all report for management page
    router.get('/resetRequestManagement', function(req, res) {
        account_reset.find({}, function(err, account_resets) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
                    if (err) {
                        // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                        var email = {
                            from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                            to: 'orvtiadeveloper@zoho.com',
                            subject: 'Error Logged',
                            text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                            html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                        };
                        // Function to send e-mail to myself
                        client.sendMail(email, function(err, info) {
                            if (err) {
                                console.log(err); // If error with sending e-mail, log to console/terminal
                            } else {
                                console.log(info); // Log success message to console if sent
                                console.log(user.email); // Display e-mail that it was sent to
                            }
                        });
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                    } else {
                        // Check if logged in report was found in database
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); // Return error
                        } else {
                            // Check if user has editing/deleting privileges
                            if (mainUser.police_permission === 'main' && mainUser.police_station === 'Lingayen') {
                                // Check if users were retrieved from database
                                if (!account_resets) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                    res.json({ success: true, account_resets: account_resets, police_permission: mainUser.police_permission }); // Return users, along with current user's permission
                                }
                            } else if (mainUser.police_permission === 'station' && mainUser.police_station === req.decoded.police_station){
                                if (!account_resets) {
                                    res.json({ success: false, message: 'No report found' }); // Return error
                                } else {
                                  account_reset.find({ station: req.decoded.police_station }, function(err, account_resets) {
                                    res.json({ success: true, account_resets: account_resets, police_permission: mainUser.police_permission, police_station: mainUser.police_station}); // Return users, along with current user's permission
                                  });
                                }
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                            }
                        }
                    }
                });
            }
        });
    });
    // Route to delete a user
    router.delete('/resetRequestManagement/:station', function(req, res) {
        var deletedRequest = req.params.station; // Assign the username from request parameters to a variable
        police_user.findOne({ police_username: req.decoded.police_username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                    to: 'orvtiadeveloper@zoho.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if current user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if curent user has admin access
                    if (mainUser.police_permission !== 'main' && mainUser.police_permission !== 'station') {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                    } else {
                        // Fine the user that needs to be deleted
                        account_reset.findOneAndRemove({ station: deletedRequest }, function(err, acc) {
                            if (err) {
                                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                                var email = {
                                    from: 'ORVTIA Team Staff, orvtiateam@zoho.com',
                                    to: 'orvtiadeveloper@zoho.com',
                                    subject: 'Error Logged',
                                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                                };
                                // Function to send e-mail to myself
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); // If error with sending e-mail, log to console/terminal
                                    } else {
                                        console.log(info); // Log success message to console if sent
                                        console.log(user.email); // Display e-mail that it was sent to
                                    }
                                });
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                res.json({ success: true }); // Return success status
                            }
                        });
                    }
                }
            }
        });
    });

   router.get('/fraud', function(req,res){
        models.Police_Report.find({report_credibility:"Fraud"},function(err, fraud){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, fraud:fraud});
            }
        })
    });
   router.get('/factual', function(req,res){
        models.Police_Report.find({report_credibility:"Factual"},function(err, factual){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, factual:factual});
            }
        })
    });
   router.get('/accidentType', function(req,res){
        models.Police_Report.find({},function(err, type){
            if(err){
                res.json(500,err);
            }else{
                res.json({success:true, type:type});
            }
        })
   })
 //routes for accident_type--------------------------------------------------------------------------------------
   router.get('/HeadOn', function(req,res){
        models.Police_Report.find({accident_type:"Head-On Collision"},function(err, HeadOn){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, HeadOn: HeadOn});
            }
        })
    });
     router.get('/animals', function(req,res){
        models.Police_Report.find({accident_type:"High Speeding Collision of Animals"},function(err, animals){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, animals: animals});
            }
        })
    });
     router.get('/Pedestrians', function(req,res){
        models.Police_Report.find({accident_type:"High Speeding Crashes with Pedestrians or Bicyclists"},function(err, Pedestrians){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Pedestrians: Pedestrians});
            }
        })
    });
     router.get('/RearEnd', function(req,res){
        models.Police_Report.find({accident_type:"Rear-End Collisions"},function(err, RearEnd){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, RearEnd: RearEnd});
            }
        })
    });
     router.get('/RollOver', function(req,res){
        models.Police_Report.find({accident_type:"Roll Over"},function(err, RollOver){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, RollOver: RollOver});
            }
        })
    });
     router.get('/SideRoadside', function(req,res){
        models.Police_Report.find({accident_type:"Side/Roadside Collision"},function(err, SideRoadside){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, SideRoadside: SideRoadside});
            }
        })
    });
     router.get('/Stationary', function(req,res){
        models.Police_Report.find({accident_type:"Stationary Collisions"},function(err, Stationary){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Stationary: Stationary});
            }
        })
    });
     router.get('/AnimalCrossings', function(req,res){
        models.Police_Report.find({accident_type:"Animal Crossings"},function(err, AnimalCrossings){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, AnimalCrossings: AnimalCrossings});
            }
        })
    });
     router.get('/DeadlyCurves', function(req,res){
        models.Police_Report.find({accident_type:"Deadly Curves"},function(err, DeadlyCurves){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, DeadlyCurves: DeadlyCurves});
            }
        })
    });
     router.get('/DefectiveBreaks', function(req,res){
        models.Police_Report.find({accident_type:"Defective Breaks"},function(err, DefectiveBreaks){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, DefectiveBreaks: DefectiveBreaks});
            }
        })
    });
     router.get('/DesignDefects', function(req,res){
        models.Police_Report.find({accident_type:"Design Defects"},function(err, DesignDefects){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, DesignDefects: DesignDefects});
            }
        })
    });
     router.get('/DistractedDriving', function(req,res){
        models.Police_Report.find({accident_type:"Distracted Driving"},function(err, DistractedDriving){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, DistractedDriving: DistractedDriving});
            }
        })
    });
     router.get('/DrunkDriving', function(req,res){
        models.Police_Report.find({accident_type:"Drunk Driving"},function(err, DrunkDriving){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, DrunkDriving: DrunkDriving});
            }
        })
    });
     router.get('/DrugInfluence', function(req,res){
        models.Police_Report.find({accident_type:"Driving Under Influence of Drugs"},function(err, DrugInfluence){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, DrugInfluence: DrugInfluence});
            }
        })
    });
     router.get('/ImproperTurns', function(req,res){
        models.Police_Report.find({accident_type:"Improper Turns"},function(err, ImproperTurns){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, ImproperTurns: ImproperTurns});
            }
        })
    });
     router.get('/Rain', function(req,res){
        models.Police_Report.find({accident_type:"Rain"},function(err, Rain){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Rain: Rain});
            }
        })
    });
     router.get('/RecklessDriving', function(req,res){
        models.Police_Report.find({accident_type:"Reckless Driving"},function(err, RecklessDriving){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, RecklessDriving: RecklessDriving});
            }
        })
    });
     router.get('/RoadRage', function(req,res){
        models.Police_Report.find({accident_type:"Road Rage"},function(err, RoadRage){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, RoadRage: RoadRage});
            }
        })
    });
     router.get('/RunningRedLights', function(req,res){
        models.Police_Report.find({accident_type:"Running Red Lights"},function(err, RunningRedLights){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, RunningRedLights: RunningRedLights});
            }
        })
    });
     router.get('/RunningStopSigns', function(req,res){
        models.Police_Report.find({accident_type:"Running Stop Signs"},function(err, RunningStopSigns){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, RunningStopSigns: RunningStopSigns});
            }
        })
    });
     router.get('/Speeding', function(req,res){
        models.Police_Report.find({accident_type:"Speeding"},function(err, Speeding){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Speeding: Speeding});
            }
        })
    });
     router.get('/StreetRacing', function(req,res){
        models.Police_Report.find({accident_type:"Street Racing"},function(err, StreetRacing){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, StreetRacing: StreetRacing});
            }
        })
    });
     router.get('/Tailgating', function(req,res){
        models.Police_Report.find({accident_type:"Tailgating"},function(err, Tailgating){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Tailgating: Tailgating});
            }
        })
    });
     router.get('/TireBlowouts', function(req,res){
        models.Police_Report.find({accident_type:"Tire Blowouts"},function(err, TireBlowouts){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, TireBlowouts: TireBlowouts});
            }
        })
    });
     router.get('/UnsafeLaneChanges', function(req,res){
        models.Police_Report.find({accident_type:"Unsafe Lane Changes"},function(err, UnsafeLaneChanges){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, UnsafeLaneChanges: UnsafeLaneChanges});
            }
        })
    });

    //route for Violation---------------------------------------------------------------
     router.get('/Negligence', function(req,res){
        models.People_Involved.find({people_involved_violation:"Negligence"},function(err, Negligence){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Negligence: Negligence});
            }
        })
    });

     router.get('/Recklessness', function(req,res){
        models.People_Involved.find({people_involved_violation:"Recklessness or wanton conduct"},function(err, Recklessness){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Recklessness: Recklessness});
            }
        })
    });
     router.get('/Intentional', function(req,res){
        models.People_Involved.find({people_involved_violation:"Intentional Misconduct"},function(err, Intentional){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Intentional: Intentional});
            }
        })
    });
     router.get('/Liability', function(req,res){
        models.People_Involved.find({people_involved_violation:"Strict Liability"},function(err, Liability){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Liability: Liability});
            }
        })
    });

     //route for vehicle type---------------------------------------------------------------
     router.get('/Bus', function(req,res){
        models.Vehicle.find({vehicle_type:"Bus"},function(err, Bus){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Bus: Bus});
            }
        })
    });

    router.get('/Car', function(req,res){
        models.Vehicle.find({vehicle_type:"Car"},function(err, Car){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Car: Car});
            }
        })
    });

    router.get('/Jeep', function(req,res){
        models.Vehicle.find({vehicle_type:"Jeep"},function(err, Jeep){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Jeep: Jeep});
            }
        })
    });
    router.get('/Bicycle', function(req,res){
        models.Vehicle.find({vehicle_type:"Bicycle"},function(err, Bicycle){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Bicycle: Bicycle});
            }
        })
    });
     router.get('/Motorcycle', function(req,res){
        models.Vehicle.find({vehicle_type:"Motorcycle"},function(err, Motorcycle){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Motorcycle: Motorcycle});
            }
        })
    });
     router.get('/Tricycle', function(req,res){
        models.Vehicle.find({vehicle_type:"Tricycle"},function(err, Tricycle){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Tricycle: Tricycle});
            }
        })
    });
     router.get('/Truck', function(req,res){
        models.Vehicle.find({vehicle_type:"Truck"},function(err, Truck){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Truck: Truck});
            }
        })
    });
     router.get('/Van', function(req,res){
        models.Vehicle.find({vehicle_type:"Van"},function(err, Van){
            if (err) {
                res.json(500, err);
            }else{
                res.json({success:true, Van: Van});
            }
        })
    });

    return router; // Return the router object to server
};
