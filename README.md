# WrenchFlow

## Your Go-To Shop Manager! (It's a Web App for Many Shops!)

Hey there! WrenchFlow is this super cool web app made to help small engine repair shops run things smoothly. It's built as a "Software-as-a-Service" (SaaS) deal, which means lots of shops can use it, and each one gets their own safe, separate space to keep everything organized. Pretty neat, right?!

### What It Can Do!

* **Customer & Equipment Stuff:** Keep tabs on your customers and their gear (snowblowers, mowers, ATVs – you name it!). You can track all the deets, including a unique serial number for each piece.

* **Parts & Where They Live:** Manage all your parts in real-time, even big barrels of oil or fluid! You can see how much you've got, what it costs, and where it's stored on your shelves. Super easy to find stuff!

* **Vendor Buddies:** Keep all your vendor info handy. You can link parts to specific vendors, making ordering a breeze.

* **Parts Ordering Made Simple:** Create new orders for parts. When they arrive, just pop in the invoice number, how much you paid, and what came in. It'll even note backordered items and update your inventory automatically. So simple!

* **Work Orders & History:** Whip up detailed work orders in no time! Add parts (even those bulk fluids!), list services, figure out the total, assign techs, and boom – you've got a full service history for every piece of equipment.

* **Appointment Booking Fun!:** Your customers can actually book appointments right from your shop's own public webpage. And you and your team (if they've got access) can create, update, or cancel those appointments, all linked to customer and equipment info. How convenient is that?!

* **Sales & Money Talk:**

    * **Over-the-Counter Parts Sales:** You can log direct sales of parts – discrete ones or those big containers of fluid – and the system updates your inventory automatically.

    * **Parts Sales Reports & Profit!:** Get detailed reports on parts sales and how much profit you're making. Shop admins and specific parts folks can see these.

    * **Service Sales Reports & Profit!:** Same deal for services! See what you're making there too! Shop admins and service team members can check these out.

    * **Overall Sales Snapshot:** There's even a dashboard to give you a quick look at your total income and profit from everything. Admins get to see this!

* **Shop Settings, Your Way:** Set your shop's labor rates, manage your employees, and track their pay rates and roles.

* **Works Even When Wi-Fi Doesn't!:** This is a big one! WrenchFlow is built to work completely offline. Everything you do saves locally, and then, magic! It automatically syncs up with the main server as soon as you get back online. No more lost data, phew!

* **Your Shop's Own Space:** Every shop gets its own private data bubble. Your info is yours, and no one else's. Super secure!

* **Admin Central:** As the main web app admin, me and my team have full access to peek at and manage data across all the shops. We've got your back!

### What's Under the Hood:

* **The Front End (What You See!):**

    * **HTML5, CSS3, Bootstrap:** We're using these for a slick, modern, and super easy-to-use look that works great on any device. Plus, cool little animations for smooth transitions!

    * **JavaScript (Vanilla JS / jQuery):** This is the brainy part that makes everything move and talk to the back end. We're keeping it organized, for sure.

    * **IndexedDB:** This is how your shop's info stays safe and sound right on your device, so you can work offline. Each shop's data is kept separate, too.

    * **AJAX (Fetch API):** This is how the app chats with the server, sending and getting all the important info in a neat, organized way.

* **The Back End (The Powerhouse!):**

    * **PHP (OOP!):** This is the main engine running the show on the server. We're building it with Object-Oriented Programming, so it's super organized and easy to expand later.

    * **MySQL:** This is where all your valuable data lives, in a super reliable database. We've got it set up so each shop's data is clearly linked.

    * **PHP Data Objects (PDO):** This keeps our database chats secure and speedy. No funny business here!

    * **RESTful API:** This is how the front end and back end talk to each other, like a well-oiled machine, sending and receiving data smoothly.

* **Staying Safe (Security First!):**

    * We're cleaning up all your inputs to stop those nasty SQL injection and XSS attacks.

    * Your login sessions are super secure.

    * **We've got CSRF protection on all forms and actions** – gotta keep those unwanted requests out!

    * Plus, a tough system that makes sure only the right people (shop admins, parts folks, service crew, or platform admins) can see and do what they're supposed to, keeping everyone's data separate and safe. Phew!

### How to Use It:

WrenchFlow's really user-friendly for all your repair shop tasks:

1.  **Just Log In:** Shops simply sign up and then log right into their own special version of the app. Easy peasy!

2.  **Customers & Gear, Managed:** Super easy to add, see, and tweak customer details and all their equipment. Each piece of gear has its own unique serial number – no mix-ups!

3.  **Track Parts & Vendors:** Keep your parts inventory spot-on, whether it's little bolts or big containers of oil. You'll know exactly where everything is and who you get it from.

4.  **Order Parts & Get 'Em In!:** Need parts? Just make an order with your vendors. When they arrive, you can quickly log what came in (and what didn't!), update costs, and boom – your inventory's updated.

5.  **Create Work Orders? Done!:** Create new service requests fast! Throw in the parts you used (yep, even that exact amount of bulk fluid!), list out the services, assign a tech, and calculate the total. You'll have a complete history right there!

6.  **Book Appointments, No Sweat:** You can handle appointments in the shop, or your customers can book 'em themselves right from your shop's public page. How cool is that for everyone?!

7.  **Keep an Eye on Sales & Profit:** Get clear reports on all your parts and service sales. See what's making money, with special access for the right team members.

8.  **Work Anywhere, Anytime!:** No internet? No problem! Keep working like normal. All your changes save right on your device, and then sync up automatically when you're back online. So convenient!

### Wanna Help Out?

Awesome! If you're interested in contributing, check out our `CONTRIBUTING.md` file for all the info. We'd love to have you!

### License:

This project is protected by a **Proprietary License**. Use of this software is subject to the terms of the WrenchFlow End-User License Agreement (EULA). Unauthorized copying, modification, redistribution, or use is strictly prohibited. For licensing inquiries, please contact \[Your Company Email/Website\].
