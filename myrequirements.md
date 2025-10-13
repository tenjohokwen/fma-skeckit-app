Build an application that will be used to view, download and upload files to google drive.
The user is not aware that the files are stored to google drive. The user can search for a file by name. 

The application uses a layout and the router switches pages within the layout. The app should have a mobile friendly menu, and a language switcher.

 ## Security
** Googlesheet **
* "users" sheet contains the following fields:
  name, email, password, type (ALLOWED, BLOCKED), url, otp, date of Expiry (datetime), roles (ROLE_ADMIN, ROLE_USER), status (PENDING, VERIFIED), verification token, salt
* "metadata" sheet contains the following fields: Client First Name,	Client Last Name,	Client Email,	Client Phone Number, 	Amount Paid,	Payment Status,	Folder Name,	Folder Path,	Assigned To ,	Assigned At, 	Last Updated By,	Last Updated At,	Tasks Remaining,	Next Action,	Comment,	Due Date,	status,	Case Id, version  

** sign up **
* name, email and password are required
* When the user fills the form and clicks the sign up button, the email is checked for duplication in the excel sheet and an error returned if the email already exist
* If the email does not exist, the name is saved in the name column and email in the email column, 
* the password is hashed and stored in the password column and the salt in the 'salt' column
* the status is mapped as "PENDING"
* the type is set to ALLOWED
* the role is set to ROLE_USER
* a verification token is created and inserted into the "verification token" column
* An email is sent with a verification link to the given email along with the  verification token.
* When the unique verification link in the email is clicked, the app is called and the app changes the status of the user entry to "verified" 


** login **
* The user needs to give his email and password to login
* If the user logs in with an email that has not been verified, the user gets an error message indicating that he his email has not been verified
* Likewise if he logs with an account that has been blocked, he gets the corresponding error message. The "type" column holds any of the values ALLOWED, BLOCKED to indicate if the account is blocked or allowed
* The sign in page should have a link to resend the verification email and another to reset the forgotten password
* If the user clicks on the "forgot password" link, a form is displayed with an input field for the user to add the email and the send button is labeled "send otp"
* When the user clicks the email and clicks send verification is performed. If the email exists in the sheet, an OTP is created with an expiry of 2 hours. 
* The OTP is inserted in the otp column and the expiration is added to the "date of expiry" column
* An email is sent to the user with the otp and the link to click. The link leads the user to the form where the user can add the otp
* The user is then sent an email indicating that a recovery email has been sent
* If the email the user entered for password recovery does not exist in the sheet, an email is sent to the user indicating that an attempt was made to log to our system using the email but the user is not registered under the given email. 
* Then the user is then sent an email indicating that a recovery email has been sent. This step is just to prevent users from knowing which emails are used to register on our system
* When the user clicks on the recovery email link, he is prompted to give in the OTP. 
* When the user gives in the opt and click submit otp, if the otp is wrong or has expired, an error message is displayed.
* if the otp is correct and matches the right user, a reset password form is displayed. The form has 2 fields: New Password and Confirm New Password 
* When filled, if "New Password" value matches "Confirm New Password" value, the user is allowed to Reset Password
* When the user clicks "Reset Password", the password is hashed and stored in the sheet
* the otp and date of expiration fields are cleared in the sheet
* The user gets a success message and user is then redirected to the app landing page

** Search Page **
This is the page that displays the data of the “metadata” sheet
The current user can search by first name and last name OR by Case Id
The search results are displayed in UI cards 
The results should contain the columns of the “metadata” sheet excluding the data of any generated column 
Users without the ROLE_ADMIN cannot switch to edit mode or edit

** Edit Page**
* This page is accessible and editable by a user with the role ROLE_ADMIN
*  The following fields are not visible to the user nor are they updatable by the user: “Assigned At”, 	“Last Updated By”,	“Last Updated At”, “version”
*  “Assigned At” is modified to current datetime (locale: Africa/Douala) each time “Assigned To” is modified. That is when the value of “Assigned To” changes
*  “Last Updated By” is filled with the current user name each time he modifies the document
* “Last Updated At” is filled with current datetime (locale: Africa/Douala) each time an update occurs.
* “version” is a number that is incremented each time the row entry changes



Folder and file management
As a user with admin rights, I want to be able to create a folder for a client on google drive through a vue js UI. I do not have to know the file storage used. I just need to be able to first search by user name and id card number in order to find out if a client has a folder on our system. If the client does not exist, I need to fill a form with client information: First Name, Last Name, Telephone, National Id Number and Email address. Upon submit, a folder is created under the root folder called “cases” using the following pattern: firstName_lastName_idCardNo.
firstName is the firstName of the user, last name is the last name of the user and idCardNo is the id card number of the user


As a user with admin rights, I want to be able to create a case folder for an existing client and upload user files that are relevant for a particular case. I find the file by First Name and  Last Name, or case Id and his folder info is displayed. Now I can fill a form whereby I give in a case id and then upload files. I will also name the files as I wish. The system creates a folder whose name is the given case id. The system inserts my loaded file in the case id folder. The case id folder itself is created within the client folder named like so firstName_lastName_idCardNo

As a user with admin rights, I want to be able to navigate the folder structure of the storage and see the various files files and types in the folders

As a user with admin rights, I want to be able delete a file

As a user with admin rights, I want to be able download a file

