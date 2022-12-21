# React Three Fiber Demos, the world of Reactive3D

This free-to-use project is a collection of micro applications, written in TypeScript using React and 3D by the end of 2022.Please try the [demo here](https://jade-swan-78e975.netlify.app/).

This project is primarily serving educational purposes, my goal was to demonstrate how 'easy' is to integrate WebGL content into React using today's standards, creating a rich but coherent user experience by using '3D Components' seemlesly integrating with the 2D World of the Web.

The 'hosting' React Application was created 'from zero' (create-react-app), as a general purpose 'Personal Portfolio', building up gradually:

- with a 'Functional First' approach, prefering the usage of Hooks and Functional Components.
- with a 'Cloud First' approach, means you can integrate with a Firebase project in minutes. (Authentication, Storage and Firestore)
- with 'Continuous Integration' approach.

# React Fiber Applications, what the heck?

These 3D Components, I like to refer to as React Fiber Applications.
The center theme of these Fiber Application were to build our 3D world step by step.

The last and [most complex demo](https://jade-swan-78e975.netlify.app/map) took about a month to create, by reusing concepts or components that were 'covered' earlier.

During the [3 months of development](https://github.com/wwwworkingprocess/cv-ts-react-fiber/commits/main/src/fiber-apps), from simpler to complex the following Fiber Apps have been created:

Basic Demos (1 day)

- Navigation Demo - Learning the very basics of a React Three Component. [source](https://github.com/wwwworkingprocess/cv-ts-react-fiber/tree/main/src/fiber-apps/navigate)
- [Keyboard Navigation Demo](https://jade-swan-78e975.netlify.app/demos/cursor-navigation) - Learning How to handle user input.
- SVG Shape Loader - Drawing, positioning and aligning 2D objects in a 2D plane. [source](https://github.com/wwwworkingprocess/cv-ts-react-fiber/tree/main/src/fiber-apps/shape-loader)
- [3D Globe Demo](https://jade-swan-78e975.netlify.app/demos/globe-3d) - How to Integrate a pre-existing Three.js application as a 'React Fiber Application' considering both mobile and desktop users.

Simple Demos (1-3 days)

- [Home Page Map Demo](https://jade-swan-78e975.netlify.app/demos/wiki-countries). - Drag & Drop in 3D.
- [Country Outline Demo](https://jade-swan-78e975.netlify.app/demos/wiki-countries). - Drawing data driven 2D shapes in a 3D environment.
- [Hungarian Settlements Demo](https://jade-swan-78e975.netlify.app/demos/hungarian-cities) - Understanding and leveraging data dependencies, when presenting in 3D.
- [HGT Elevation Demo](https://jade-swan-78e975.netlify.app/demos/hgt-elevation) - Displaying real world topography in 3D, partitioning 2D and 3D space.

Intermediate complexity Demo (1 week)

- [Topographic Map Viewer](https://jade-swan-78e975.netlify.app/viewer) - Displaying topography in both 2D and 3D from anywhere around the world. Using compression, persisted module-level state and generally extending the Elevation Demo in every 'meaningful' way.

Real Life complexity Demo (1 month of development)

- [WikiData World Demography](https://jade-swan-78e975.netlify.app/map) - Displaying demography information about 60+ countries using 'country datasets' and WikiData API. To support content sharing every displayed element has a permalink, so you can start in [Belgium](https://jade-swan-78e975.netlify.app/map/Q31) or you can even start at a specific location like [Copenhagen in Denmark](https://jade-swan-78e975.netlify.app/map/Q35/Q1748). When displaying the details of a location, the application shows every information (claim) received from WikiData, not exclusively demography related content, so finally this happened to become 'My Hitchhiker Guide to the Galaxy'. ;)

All the above Fiber Applications are 'standalone' and can be used as a good starting point of a more complex solution. This is not the 'best way', but 'one way' of creating Reactive 3D Components. The project's minimalist design is intended, as in such a sort time frame, I liked to be more focused on 'how things work', not on 'how things look'. Feel free to fork the repo or use/extend these Fiber Applications or the Fibers they made of.

# Getting Started, Local Installation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Package management made with [yarn](https://yarnpkg.com/). Be sure you have node, npm and yarn installed.

1. After cloning the repo, install the project with

### `yarn install`

2. Make a copy of the provided .env.sample file, located in the project's root folder and rename it to .env .
3. Ensure you have the following key in your .env file with the value of FALSE

### REACT_APP_FIREBASE_ENABLED=FALSE

## Running the Project

After successful installation, in the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Getting Started, Cloud Installation

To be added extended soon...

1. After cloning the repo, install the project with

### `yarn install`

2. Make a copy of the provided .env.sample file, located in the project's root folder and rename it to .env .
3. Ensure you have the following key in your .env file with the value of FALSE

### REACT_APP_FIREBASE_ENABLED=TRUE

4. Also make sure you set the following environment variables in your .env file and/or cloud hosting provider (e.g. Netlify)

### REACT_APP_FIREBASE_PROJECT_ID=your-project-id

### REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.appspot.com

### REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com

### REACT_APP_FIREBASE_API_KEY=your-api-key

### REACT_APP_FIREBASE_APP_ID=your-app-id

### REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id

# Country Dataset Generation

To be added soon...
