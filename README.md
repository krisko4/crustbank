# CrustBank 
CrustLab internship interview task solution

## Task
<p align="center">
  <img src="https://user-images.githubusercontent.com/80395610/165046946-0e804459-7623-4787-81fa-164373877d2e.png">
</p>

## Solution

### How to run the project?

- clone the repository
- type **npm install** in the terminal to install the dependencies
- type **npm run start:dev** in the terminal to run the application in the watch mode
- type **npm run test:watch** in the terminal to run the tests in the watch mode

###  Technology stack

In order to complete the task, I have decided to use **NestJS** framework, which makes it easy to implement high quality server applications. It includes some great and useful features, such as built in TypeScript support, ESLint and architecture design. It is also compatible with multiple modern JavaScript libraries. 

I have used in-memory **MongoDB** document database in order to manage data, with **mongoose** driver to create schemas and models.

### Architecture

As mentioned above, NestJS imposes an architecture, which is based on modules, controllers and providers, e.g. services. Such design makes the code easy to test and maintain. Since the task does not require any sort of user interface or API to be created, controllers were not used in the project.

### Design patterns & principles

NestJS framework provides an IoC container, which is responsible for the management of components lifecycle. It means that the programmer does neither have to instantiate or destroy objects - it is done automatically (under the hood). The dependencies between classes are injected through constructors, which is useful for tests. For example, the user service injects the user repository through the constructor, and so does the repository with data model.


![1_iO7R3erL7nquWs6vfm3cMA](https://user-images.githubusercontent.com/80395610/165049036-ca9bb1ef-18c7-46ac-bc6f-993565789512.png)

In the solution, I have decided to use repositories in order to manage data interactions and limit service responsibilities to handle business logic.

### Database models

I have decided to take advantage of document nature of MongoDB and keep most of the data in embedded document, which makes things easier in many cases, e.g. transactions, data access and increases performance. For this reason, two document models have been created: **User** and **Transfer**. The User model holds most of the data as embedded documents - account types, deposits, exchanges and withdrawals. However, since funds transfer is an operation between two users, including such operation as an embedded document in the User model would provide some unnecessary redundancy. For this reason, Transfer is a separate model, which references User models by id.


### Folder structure

The folder structure is modular and includes two main modules - **transfer** and **user**, according to database models mentioned above. The **configuration** file is a task requirement fulfillment - currency courses are loaded from the configuration file (currencies.yaml) as the application starts. The **database** module is an in-memory database setup module. In this module, the **repository** file has been created. It is a generic abstract class which provides some basic methods for database interactions. Each repository in the project extends the abstract repository. **main.ts** file is a bootstrap of the project. 

![image](https://user-images.githubusercontent.com/80395610/165050245-0c6b8fa0-fd0d-4dc3-9ece-1658bd1e55a3.png)

#### User module

The purpose of a user module is to implement all the methods defined in **user.interface** file, which includes the features mentioned in task requirements. Let's briefly walk through some main directories and files provided in the module:

- **__mocks__** - the directory used for unit tests. It includes mocked repository and service, which can be used across the entire project
- **dto** - the directory which includes all Data Transfer Objects
- **enums** - the directory which includes all useful enumerations
- **interfaces** - the directory which includes interfaces, which can be implemented by providers, e.g. services
- **schemas** - the directory which includes all the schemas related to User model
- **test** - the directory which includes all test utilities specific to user module
- **test.integration** - the directory which includes integration tests
- **test.stubs** - the directory which includes test stubs - some reusable pieces of test data
- **validators** - the directory which includes some business logic validation
- **user.service** - UserService implementation
- **user.repository** - UserRepository implementation
- **.spec** - all the files used for tests

![image](https://user-images.githubusercontent.com/80395610/165055906-6d3c29fb-2c8b-4bd5-b761-2762ace4a410.png)

### Transfer module

The folder structure presented above in the **User module** can be used in multiple modules. For this reason, the **Transfer module** structure is equivalent to the solution explained above.

![image](https://user-images.githubusercontent.com/80395610/165056991-dd693322-a98c-48fc-ad52-7a7bba7a40c2.png)

Each module includes **.module** file which allows NestJS IoC container to connect all the modules.

### Features

The features have been presented in two interfaces - **TransferInterface** and **UserInterface**. 

#### TransferInterface

- create new transfer instance
- find all transfers
- find transfers by receiver id
  - find all transfers
  - find transfers in given date range
- find transfers by sender id
  - find all transfers
  - find transfers in given date range
 
#### UserInterface

- create new user instance
- find all users
- find user by id
- find PLN account for given user id
- find EUR account for given user id
- find USD account for given user id
- transfer funds from one user to another
- deposit funds to selected account type
- withdraw funds from selected account type
- find deposits for given user id
  - find all deposits
  - find deposits in given date range
- find withdrawals for given user id
  - find all withdrawals
  - find withdrawals in given date range
- find exchanges for given user id
  - find all exchanges
  - find exchanges in given date range

### Tests

The solution has been tested automatically. The tests can be found in **test/integration** directories in both modules: **transfer** and **user**. The purpose of provided tests was to validate service business logic and integration between service methods and database changes. I think it could have been done better - the integration should be tested between repositories and database. Then, the services should be unit tested using repository mocks. However, due to the time limitations, I have decided to reduce the amount of tests. Some simple unit tests have also been performed, e.g. to validate if FundsValidator works properly.
