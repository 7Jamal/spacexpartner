# PayPal Connect

Build a Professional Employee Payment Management Portal 
Create a modern, secure, and professional employee payment management web application with a clean 2026-style interface. The website must be responsive, fast, mobile-friendly, and extremely easy for employees to use.
Name: SPACE PARTNERSHIP PORTAL
Super Administrator
Create a permanent Super Administrator account with the following email:
Admin Email: Chimmytopc@gmail.com
This email must automatically have full administrator privileges from the moment the project is created.
The Super Administrator must have unrestricted access to every part of the system.
No employee should ever be able to register as an administrator or promote themselves to administrator.
Only Chimmytopc@gmail.com can:
* Access the Admin Dashboard
* View every employee
* View every employee’s profile
* View employee bank details
* Manage employee accounts
* Edit employee information
* Suspend or reactivate employees
* Delete employees
* View payment history
* Update payment status
* Send announcements
* Manage notifications
* View reports
* Export employee data
* Control all website settings
Employee Registration
Employees should be able to register easily without email verification.
Registration requires only:
* Full Name
* Email Address
* Password
After registration, employees should immediately be able to log in and access their dashboard.
Employee Login
Provide a simple login page with:
* Email Address
* Password
* Forgot Password
No email verification should be required.
Employee Dashboard
Each employee should have a private dashboard displaying:
* Welcome message
* Weekly salary: $5,000
* Next payment date
* Countdown to the next payment
* Current payment status
* Company announcements
* Notifications
* Payment history
* Profile settings
* Logout
Bank Details
Employees can securely enter and update:
* Account Name
* Bank Name
* Account Number
* Swift Code (Optional)
* Country
* Currency
* Additional payment instructions (Optional)
These details should only be visible to the Super Administrator.
Weekly Payments
Every employee receives $5,000 every week.
The dashboard should automatically display:
* Next payment date
* Days remaining
* Countdown timer
Payment Status
The Super Administrator can change each employee’s payment status to:
* Upcoming
* Pending
* Processing
* Successful
* Failed
* Postponed
* Cancelled
Display each status with a different color.
Employees should immediately see any updates when they log in.
Company Notice Board
Each employee dashboard should include a notice board.
The Super Administrator can post announcements such as:
* Payment postponed
* Payment processing
* Company holiday
* New company policy
* Weekly update
* General announcement
Announcements should appear instantly on every employee dashboard.
Notifications
Whenever the administrator updates a payment status or posts an announcement, employees should receive an in-app notification.
Payment Calendar
Display:
* Upcoming weekly payments
* Previous payments
* Payment history
* Next payment date
Admin Dashboard
Only Chimmytopc@gmail.com can access this dashboard.
The Admin Dashboard should include:
* Total Employees
* Active Employees
* Suspended Employees
* Total Successful Payments
* Pending Payments
* Failed Payments
* Upcoming Payments
Display these as beautiful statistic cards.
Employee Management
The administrator should be able to:
* Search employees
* View employee profiles
* Edit employee details
* Delete employees
* Suspend employees
* Reactivate employees
* View bank information
* View registration dates
* View last login
* Change payment status
* Export employee data
Employee Table
Display:
* Full Name
* Email
* Registration Date
* Bank Name
* Account Number
* Payment Status
* Last Login
* Action Buttons
Security
Include:
* Secure password encryption
* Protected database
* Secure administrator-only pages
* Input validation
* Protection against unauthorized access
Database
Store:
* Employee information
* Login credentials
* Bank details
* Payment records
* Payment status
* Notifications
* Announcements
* Registration dates
* Login history
Responsive Design
The website must work perfectly on:
* Mobile phones
* Tablets
* Desktop computers
Design
Create a premium 2026 interface featuring:
* Elegant dashboard
* Modern cards
* Smooth animations
* Professional icons
* Light Mode
* Dark Mode
* Fast loading
* Clean and luxurious appearance
Future Scalability
Add Secure Document Upload
On the Employee Dashboard, add a new section called:
Supporting Documents
Place it below the bank details section.
Allow employees to upload files that the company may request, such as:
* Identification documents
* Banking documents
* Employment documents
* Other company-approved supporting documents
Requirements:
* Drag-and-drop upload
* Upload button
* Image preview for image files
* Display uploaded filename
* Replace existing file
* Delete uploaded file
* Progress indicator while uploading
Accepted file types:
* JPG
* JPEG
* PNG
* PDF
Maximum file size:
20 MB
Store uploaded files securely.
The uploaded documents must be visible only to:
* The employee who uploaded them
* The Super Administrator
Regular employees must never be able to see another employee’s uploaded documents.
⸻
. Admin View of Uploaded Documents
Inside every employee profile on the Admin Dashboard, add a section called:
Uploaded Documents
The Super Administrator should be able to:
* View uploaded documents
* Download documents
* Delete documents if necessary
FIX ONLY THE NOTIFICATION CONTENT DISPLAY.
Do NOT redesign the notification system.
Do NOT change the existing UI, layout, colors, branding, authentication, database structure, employee dashboard, admin dashboard, or any other feature.
The notification can now be clicked successfully, but there is still one important problem:
When the Super Administrator creates a notification, the notification contains:
Title
Full message/content
Date and time
Sender
The employee receives the notification and can click it, but when the employee opens the notification details, ONLY THE TITLE IS DISPLAYED.
The FULL MESSAGE/CONTENT written by the Super Administrator is missing.
FIX THIS.
REQUIRED BEHAVIOR:
When the Super Administrator publishes a notification such as:
Title:
Important Payment Update
Message:
Dear employees, please be informed that this week's payment will be processed on Friday. Kindly make sure your bank information is correct before the payment date.
The employee notification list may show:
Important Payment Update
with a short preview.
BUT when the employee clicks the notification, the Notification Details view MUST display the ENTIRE notification:
Title:
Important Payment Update
Full Message:
Dear employees, please be informed that this week's payment will be processed on Friday. Kindly make sure your bank information is correct before the payment date.
Date and time:
[actual publication date and time]
Sender:
Super Administrator
Do NOT truncate the message.
Do NOT show only the title.
Do NOT replace the message with a preview.
Do NOT use placeholder text.
The exact message/content entered by the Super Administrator when creating the notification must be saved and passed to the employee Notification Details view.
IMPORTANT DATABASE/DATA FIX:
Check the notification creation form and verify that the FULL MESSAGE entered by the Super Administrator is actually being saved to the notification record.
Then check the notification retrieval/query and verify that the FULL MESSAGE field is being retrieved.
Then check the notification details component and verify that it displays the retrieved FULL MESSAGE field.
Trace the complete data flow:
Super Admin creates notification
→ Full title + full message are saved
→ Employee receives notification
→ Employee clicks notification
→ Full notification record is retrieved
→ Notification Details displays the complete title AND complete message.
If the current database field is named message, content, body, description, or something similar, use the existing correct field rather than creating duplicate fields unnecessarily.
If the current notification data structure does not have a field for the full message, add the necessary message/content field and migrate the existing notification functionality to use it.
Preserve all existing notifications.
Existing notifications must also display their full message/content where that information is already stored.
Also ensure long notifications work correctly, including multiple paragraphs.
The employee should be able to scroll through the entire notification if it is long.
Keep the current notification design and only fix the missing notification content.
TEST REQUIREMENT:
After making the fix, create a test notification from the Super Administrator containing a long message with multiple sentences.
Open the employee account.
Click the notification.
Verify that the employee can see:
The complete title.
The complete message written by the Super Administrator.
The date and time.
The sender.
Do not finish the task until the FULL MESSAGE is visible to the employee.
Again: DO NOT change anything else in the application. ONLY fix the notification data storage, retrieval, and full-content display.
Build the system using clean, scalable code so future features such as payroll reports, document uploads, advanced analytics, and additional employee management tools can be added without rebuilding the project.
Important Requirement
The email Chimmytopc@gmail.com must be permanently configured as the Super Administrator account with complete control over the platform. No other user should be able to gain administrator privileges through registration or any other method unless explicitly granted by the Super Administrator.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://spacexpartner.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8fd79ed5-ce0c-413e-9523-ef1058854e49).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
