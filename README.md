# Betacolony Events List

This was written for a [Colony coding challenge](https://github.com/JoinColony/coding-challenge-events-list) as part of their application process. This code is my own work but the majority of it came from the instructions of that challenge.

## Notes for the Reviewer

There are a few things worthy of noting that I did for this challenge:

The instructions suggested adding pagination or infinite scrolling to the list. I would have done so but pagination or infinite scrolling isn't practical in this context. The items in the list must be ordered chronologically. To do that the timestamp of the transaction must be loaded with the time consuming getBlockTime() method in the colony-js library. Thus you cannot sort the items until each one has been loaded. Since each item is already loaded anyway, there's no point in using pagination or infinite scrolling.

In a larger scale application where you are using Redux to manage application state, it would be far easier to load items and sort them as they come in. Then pagination might make sense. There are plenty of optimizations that could be made, but this is well outside the scope of this task.

The instructions say to add a top and bottom padding of 26px to the list items. This doesn't work well on an element with a fixed height, since the padding will simply be added to the height. It's better to set a fixed height and then center the content vertically.
The instructions state that one of the purposes of this challenge is to check that the developer is paying attention to details, which is the only reason I felt this was worth mentioning.

## Build

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn`

Builds the dependencies for the project.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
